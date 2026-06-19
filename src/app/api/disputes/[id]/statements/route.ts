import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { Prisma, type DisputeStatus, type DisputeStatement } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSessionUserId } from '@/lib/auth/session'
import { moderateContent } from '@/lib/ai/moderation'
import { extractDisputeMeta } from '@/lib/ai/judgment'
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
})

interface StatementData {
  id: string
  disputeId: string
  role: string
  content: string
  submittedAt: string | null
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

  const { content } = parsed.data

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
    const [participant, dispute] = await Promise.all([
      prisma.disputeParticipant.findFirst({
        where: { disputeId, userId },
        include: { statements: true },
      }),
      prisma.dispute.findFirst({ where: { id: disputeId } }),
    ])

    if (!participant) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'FORBIDDEN', message: '해당 사건의 참여자가 아닙니다.' } },
        { status: 403 },
      )
    }

    if (!dispute) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'DISPUTE_NOT_FOUND', message: '사건을 찾을 수 없습니다.' } },
        { status: 404 },
      )
    }

    // 판결 이후 상태에서는 진술 수정 불가
    const immutableStatuses: DisputeStatus[] = ['JUDGING', 'JUDGED', 'CLOSED', 'DELETED', 'EXPIRED']
    if (immutableStatuses.includes(dispute.status)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'CONFLICT', message: '현재 상태에서는 진술을 수정할 수 없습니다.' } },
        { status: 409 },
      )
    }

    const existingStatement = participant.statements[0] ?? null
    const isNew = !existingStatement

    // 최초 저장 시에만 상태 전이 적용
    let newDisputeStatus: DisputeStatus | null = null
    if (participant.role === 'ROLE_A' && dispute.status === 'DRAFT') {
      newDisputeStatus = 'WAITING_OPPONENT'
    } else if (participant.role === 'ROLE_B' && dispute.status === 'OPPONENT_JOINED') {
      newDisputeStatus = 'BOTH_SUBMITTED'
    }

    // AI 1: 욕설 감지 모더레이션
    let moderation
    try {
      moderation = await moderateContent(content)
    } catch (err) {
      // Gemini 실패 시 fail open — pending 상태로 저장
      console.error('[moderation] Gemini call failed:', err)

      let statement: DisputeStatement

      if (isNew) {
        try {
          statement = await prisma.disputeStatement.create({
            data: {
              disputeId,
              participantId: participant.id,
              userId,
              role: participant.role,
              content,
              moderationStatus: 'pending',
              submittedAt: new Date(),
            },
          })
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            throw e
          }
          throw e
        }
      } else {
        statement = await prisma.disputeStatement.update({
          where: { id: existingStatement.id },
          data: { content, moderationStatus: 'pending', submittedAt: new Date() },
        })
      }

      if (newDisputeStatus) {
        await prisma.dispute.update({ where: { id: disputeId }, data: { status: newDisputeStatus } })
      }

      return NextResponse.json<ApiResponse<StatementData>>(
        {
          success: true,
          data: {
            id: statement.id,
            disputeId: statement.disputeId,
            role: statement.role.toLowerCase(),
            content: statement.content,
            submittedAt: statement.submittedAt?.toISOString() ?? null,
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

    // 정상 저장 + ModerationLog 트랜잭션
    const statement = await prisma.$transaction(async (tx) => {
      let stmt: DisputeStatement

      if (isNew) {
        try {
          stmt = await tx.disputeStatement.create({
            data: {
              disputeId,
              participantId: participant.id,
              userId,
              role: participant.role,
              content,
              moderationStatus: 'approved',
              submittedAt: new Date(),
            },
          })
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            throw e
          }
          throw e
        }
      } else {
        stmt = await tx.disputeStatement.update({
          where: { id: existingStatement.id },
          data: { content, moderationStatus: 'approved', submittedAt: new Date() },
        })
      }

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

      if (newDisputeStatus) {
        await tx.dispute.update({ where: { id: disputeId }, data: { status: newDisputeStatus } })
      }

      return stmt
    })

    // AI 2: title/description 추출 (fail-safe — 저장은 완료된 후 비동기 업데이트)
    extractDisputeMeta(content)
      .then((meta) =>
        prisma.dispute.update({
          where: { id: disputeId },
          data: { title: meta.title, description: meta.summary },
        }),
      )
      .catch((err) => console.error('[statements] extractDisputeMeta failed:', err))

    return NextResponse.json<ApiResponse<StatementData>>(
      {
        success: true,
        data: {
          id: statement.id,
          disputeId: statement.disputeId,
          role: statement.role.toLowerCase(),
          content: statement.content,
          submittedAt: statement.submittedAt?.toISOString() ?? null,
          hasPersonalInfo: moderation.hasPersonalInfo,
        },
      },
      { status: isNew ? 201 : 200 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[disputes/statements] api error', { message })
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
