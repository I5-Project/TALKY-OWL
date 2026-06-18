import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSessionUserId } from '@/lib/auth/session'
import { moderateContent } from '@/lib/ai/moderation'
import type { ApiResponse } from '@/types/common'

const DEV_BYPASS = process.env.NODE_ENV === 'development'

function getByteLength(str: string): number {
  let bytes = 0
  for (const char of str) {
    bytes += char.charCodeAt(0) > 0x7f ? 2 : 1
  }
  return bytes
}

const statementSchema = z.object({
  content: z
    .string()
    .min(1, '진술 내용을 입력해주세요.')
    .refine((val) => getByteLength(val) <= 1000, '진술 내용은 1000바이트 이하로 입력해주세요.'),
  mbti: z
    .string()
    .length(4, 'MBTI는 4자리여야 합니다.')
    .optional(),
})

interface StatementData {
  id: string
  disputeId: string
  role: string
  content: string
  submittedAt: null
  hasPersonalInfo: boolean
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions)
  let userId = getSessionUserId(session)

  if (!userId) {
    if (!DEV_BYPASS) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 },
      )
    }
    userId = 'dev-bypass-user'
  }

  const { id: disputeId } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INVALID_REQUEST', message: '요청 본문을 파싱할 수 없습니다.' } },
      { status: 400 },
    )
  }

  const parsed = statementSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '입력값이 올바르지 않습니다.',
          fieldErrors: parsed.error.errors.map((e) => ({
            field: e.path.join('.'),
            code: e.code,
            message: e.message,
          })),
        },
      },
      { status: 400 },
    )
  }

  const { content, mbti } = parsed.data

  // 개발 환경 bypass: DB 없이 모더레이션만 테스트
  if (DEV_BYPASS && userId === 'dev-bypass-user') {
    let moderation
    try {
      moderation = await moderateContent(content)
    } catch (err) {
      console.error('[moderation] Gemini call failed:', err)
      return NextResponse.json<ApiResponse<StatementData>>(
        {
          success: true,
          data: { id: 'dev-mock', disputeId, role: 'role_a', content, submittedAt: null, hasPersonalInfo: false },
        },
        { status: 201 },
      )
    }

    if (moderation.isBlocked) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'CONTENT_BLOCKED',
            message: moderation.reason ?? '부적절한 표현이 포함되어 있습니다. 내용을 수정해주세요.',
          },
        },
        { status: 422 },
      )
    }

    return NextResponse.json<ApiResponse<StatementData>>(
      {
        success: true,
        data: {
          id: 'dev-mock',
          disputeId,
          role: 'role_a',
          content,
          submittedAt: null,
          hasPersonalInfo: moderation.hasPersonalInfo,
        },
      },
      { status: 201 },
    )
  }

  try {
    const participant = await prisma.disputeParticipant.findFirst({
      where: { disputeId, userId },
      include: { statements: true },
    })

    if (!participant) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'FORBIDDEN', message: '해당 사건의 참여자가 아닙니다.' } },
        { status: 403 },
      )
    }

    const existingStatement = participant.statements[0] ?? null

    if (existingStatement?.submittedAt) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'CONFLICT', message: '이미 제출된 진술은 수정할 수 없습니다.' } },
        { status: 409 },
      )
    }

    const isNew = !existingStatement

    // 욕설 감지 모더레이션
    let moderation
    try {
      moderation = await moderateContent(content)
    } catch (err) {
      // Gemini 실패 시 fail open — pending 상태로 저장, ModerationLog 생략
      console.error('[moderation] Gemini call failed:', err)

      const statement = await prisma.disputeStatement.upsert({
        where: { disputeId_role: { disputeId, role: participant.role } },
        create: {
          disputeId,
          participantId: participant.id,
          userId,
          role: participant.role,
          content,
          moderationStatus: 'pending',
        },
        update: { content, moderationStatus: 'pending' },
      })

      return NextResponse.json<ApiResponse<StatementData>>(
        {
          success: true,
          data: {
            id: statement.id,
            disputeId: statement.disputeId,
            role: statement.role.toLowerCase(),
            content: statement.content,
            submittedAt: null,
            hasPersonalInfo: false,
          },
        },
        { status: isNew ? 201 : 200 },
      )
    }

    // 욕설/부적절 표현 감지 → 차단 (저장 없이 ModerationLog만 기록)
    if (moderation.isBlocked) {
      await prisma.moderationLog.create({
        data: {
          disputeId,
          userId,
          target: 'STATEMENT',
          isBlocked: true,
          reason: moderation.reason,
          confidenceScore: moderation.confidenceScore,
          durationMs: moderation.durationMs,
          modelName: moderation.modelName,
        },
      })

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'CONTENT_BLOCKED',
            message: moderation.reason ?? '부적절한 표현이 포함되어 있습니다. 내용을 수정해주세요.',
          },
        },
        { status: 422 },
      )
    }

    // 정상 저장 + ModerationLog + user.mbti 업데이트 트랜잭션
    const statement = await prisma.$transaction(async (tx) => {
      const stmt = await tx.disputeStatement.upsert({
        where: { disputeId_role: { disputeId, role: participant.role } },
        create: {
          disputeId,
          participantId: participant.id,
          userId,
          role: participant.role,
          content,
          moderationStatus: 'approved',
        },
        update: { content, moderationStatus: 'approved' },
      })

      await tx.moderationLog.create({
        data: {
          disputeId,
          statementId: stmt.id,
          userId,
          target: 'STATEMENT',
          isBlocked: false,
          reason: null,
          confidenceScore: moderation.confidenceScore,
          durationMs: moderation.durationMs,
          modelName: moderation.modelName,
        },
      })

      if (mbti) {
        await tx.user.update({
          where: { id: userId },
          data: { mbti },
        })
      }

      return stmt
    })

    return NextResponse.json<ApiResponse<StatementData>>(
      {
        success: true,
        data: {
          id: statement.id,
          disputeId: statement.disputeId,
          role: statement.role.toLowerCase(),
          content: statement.content,
          submittedAt: null,
          hasPersonalInfo: moderation.hasPersonalInfo,
        },
      },
      { status: isNew ? 201 : 200 },
    )
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
