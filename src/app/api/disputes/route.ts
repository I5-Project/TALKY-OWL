import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma, type CategoryGroup as PrismaCategoryGroup, DisputeStatus } from '@prisma/client'
import { prisma } from '@/lib/db'
import { getRequestUserId } from '@/lib/auth/session'
import { VALID_CATEGORY_GROUPS, COMPLETED_DISPUTE_STATUSES, CATEGORY_ACTIVE_LIMIT } from '@/lib/constants/dispute'
import { moderateContent } from '@/lib/ai/moderation'
import { extractDisputeMeta } from '@/lib/ai/judgment'
import type { ApiResponse, CategoryGroup } from '@/types/common'
import type { DisputeDto, DisputeParticipantDto, DisputeListResponse } from '@/types/dispute'

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timerId: ReturnType<typeof setTimeout>
  const timeout = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => reject(new Error(`${label} timeout`)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timerId))
}

const createDisputeSchema = z.object({
  roomId: z.string().uuid('유효하지 않은 방 ID입니다.'),
  categoryGroup: z.enum(VALID_CATEGORY_GROUPS, {
    errorMap: () => ({ message: '카테고리는 romance, family, friend, work 중 하나여야 합니다.' }),
  }).optional(),
  content: z.string().min(1, '진술 내용을 입력해주세요.'),
  sourceConversationId: z.string().uuid('유효하지 않은 대화 ID입니다.').optional(),
})

type DisputeForList = Prisma.DisputeGetPayload<{
  include: { participants: { include: { user: { select: { profileImageUrl: true; image: true } } } } }
}>

function toParticipantDto(p: DisputeForList['participants'][number]): DisputeParticipantDto {
  return {
    id: p.id,
    disputeId: p.disputeId,
    userId: p.userId,
    role: p.role.toLowerCase() as DisputeParticipantDto['role'],
    name: null,
    profileImageUrl: p.user.profileImageUrl ?? p.user.image ?? null,
    mbti: null,
    joinedAt: p.joinedAt.toISOString(),
    createdAt: p.createdAt.toISOString(),
  }
}

function toDisputeDto(dispute: DisputeForList): DisputeDto {
  return {
    id: dispute.id,
    roomId: dispute.roomId,
    sourceConversationId: dispute.sourceConversationId ?? null,
    categoryGroup: dispute.categoryGroup.toLowerCase() as CategoryGroup,
    title: dispute.title,
    description: dispute.description ?? null,
    status: dispute.status.toLowerCase() as DisputeDto['status'],
    createdAt: dispute.createdAt.toISOString(),
    updatedAt: dispute.updatedAt.toISOString(),
    participants: dispute.participants.map(toParticipantDto),
  }
}

// GET /api/disputes
// 내가 참여한 사건 목록 조회. categoryGroup으로 필터링, page/limit으로 페이지네이션
export async function GET(request: NextRequest) {
  const userId = await getRequestUserId(request)
  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    )
  }

  const { searchParams } = new URL(request.url)
  const rawCategory = searchParams.get('categoryGroup')
  const date = searchParams.get('date')
  const rawStatus = searchParams.get('status')
  // URL 쿼리 파라미터는 문자열로 전달되므로 "true" 문자열과 비교
  const active = searchParams.get('active') === 'true'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))

  if (rawCategory !== null && !VALID_CATEGORY_GROUPS.includes(rawCategory as CategoryGroup)) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '유효하지 않은 카테고리입니다.',
          fieldErrors: [
            {
              field: 'categoryGroup',
              code: 'INVALID_ENUM_VALUE',
              message: '카테고리는 romance, family, friend, work 중 하나여야 합니다.',
            },
          ],
        },
      },
      { status: 400 },
    )
  }

  const where = {
    deletedAt: null,
    participants: { some: { userId } },
    ...(rawCategory ? { categoryGroup: rawCategory.toUpperCase() as PrismaCategoryGroup } : {}),
    ...(date ? {
      createdAt: {
        gte: new Date(date),
        lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
      },
    } : {}),
    // active=true 일 때 진행중 상태만 필터링 (status 파라미터가 없을 때만 적용)
    // draft(진술 전), judged(판결 완료), closed/expired/deleted 제외
    ...(active && !rawStatus ? {
      status: {
        in: [
          DisputeStatus.WAITING_OPPONENT,
          DisputeStatus.OPPONENT_JOINED,
          DisputeStatus.BOTH_SUBMITTED,
          DisputeStatus.JUDGING,
        ],
      },
    } : {}),
    ...(rawStatus ? { status: rawStatus.toUpperCase() as DisputeStatus } : {}),
  }

  try {
    const [disputes, total] = await prisma.$transaction([
      prisma.dispute.findMany({
        where,
        include: { participants: { include: { user: { select: { profileImageUrl: true, image: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.dispute.count({ where }),
    ])

    return NextResponse.json<ApiResponse<DisputeListResponse>>({
      success: true,
      data: { disputes: disputes.map(toDisputeDto), total, page, limit, hasNext: page * limit < total },
    })
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}

interface DisputeResult {
  id: string
  hasPersonalInfo: boolean
}

// POST /api/disputes
// roomId 기준으로 새 사건 생성(role_a) 또는 기존 사건에 진술 저장(role_b/수정) 통합 처리
export async function POST(request: NextRequest) {
  const userId = await getRequestUserId(request)
  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INVALID_REQUEST', message: '요청 본문을 파싱할 수 없습니다.' } },
      { status: 400 },
    )
  }

  const parsed = createDisputeSchema.safeParse(body)
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

  const { roomId, categoryGroup, content, sourceConversationId } = parsed.data

  try {
    const room = await prisma.disputeRoom.findFirst({ where: { id: roomId, deletedAt: null } })
    if (!room) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'ROOM_NOT_FOUND', message: '방을 찾을 수 없습니다.' } },
        { status: 404 },
      )
    }
    if (room.roomMode === 'CLOSED' || room.roomMode === 'EXPIRED') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'ROOM_NOT_READY', message: '이미 종료되거나 만료된 방입니다.' } },
        { status: 422 },
      )
    }

    const existingDispute = await prisma.dispute.findFirst({
      where: { roomId },
      include: { participants: { include: { statements: true } } },
    })

    // ── 케이스 A: 새 사건 생성 (dispute 없음, 방 생성자만 가능) ──
    if (!existingDispute) {
      if (room.creatorUserId !== userId) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: { code: 'FORBIDDEN', message: '사건을 생성할 권한이 없습니다.' } },
          { status: 403 },
        )
      }

      const resolvedCategory = categoryGroup ?? 'romance'

      const activeCount = await prisma.dispute.count({
        where: {
          categoryGroup: resolvedCategory.toUpperCase() as PrismaCategoryGroup,
          deletedAt: null,
          status: { notIn: [...COMPLETED_DISPUTE_STATUSES] },
          participants: { some: { userId } },
        },
      })
      if (activeCount >= CATEGORY_ACTIVE_LIMIT) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: { code: 'CATEGORY_LIMIT_EXCEEDED', message: '사건은 카테고리당 2개까지만\n생성이 가능합니다.' } },
          { status: 422 },
        )
      }

      const [moderationResult, metaResult] = await Promise.allSettled([
        withTimeout(moderateContent(content), 8000, 'moderateContent'),
        withTimeout(extractDisputeMeta(content), 10000, 'extractDisputeMeta'),
      ])

      let moderation = { isBlocked: false, hasPersonalInfo: false, confidenceScore: null as number | null, durationMs: null as number | null, modelName: null as string | null, reason: null as string | null }
      let moderationSucceeded = false
      if (moderationResult.status === 'fulfilled') {
        moderation = moderationResult.value
        moderationSucceeded = true
      } else {
        console.error('[disputes] moderation failed', { message: moderationResult.reason instanceof Error ? moderationResult.reason.message : 'unknown', userId, roomId })
      }

      if (moderation.isBlocked) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: { code: 'CONTENT_BLOCKED', message: moderation.reason ?? '부적절한 표현이 포함되어 있습니다. 내용을 수정해주세요.' } },
          { status: 422 },
        )
      }

      if (metaResult.status === 'rejected') {
        const msg = metaResult.reason instanceof Error ? metaResult.reason.message : String(metaResult.reason)
        if (msg.includes('timeout')) return NextResponse.json<ApiResponse>({ success: false, error: { code: 'AI_EXTRACTION_TIMEOUT', message: 'AI 분석 시간이 초과됐습니다. 다시 시도해주세요.' } }, { status: 504 })
        if (msg.includes('JSON')) return NextResponse.json<ApiResponse>({ success: false, error: { code: 'AI_EXTRACTION_PARSE_ERROR', message: 'AI 응답 처리 중 오류가 발생했습니다. 다시 시도해주세요.' } }, { status: 502 })
        return NextResponse.json<ApiResponse>({ success: false, error: { code: 'AI_EXTRACTION_FAILED', message: 'AI 분석에 실패했습니다. 다시 시도해주세요.' } }, { status: 503 })
      }

      const { title, summary: description } = metaResult.value
      if (!title) {
        return NextResponse.json<ApiResponse>({ success: false, error: { code: 'AI_EXTRACTION_FAILED', message: 'AI가 사건 제목을 추출하지 못했습니다. 다시 시도해주세요.' } }, { status: 503 })
      }

      const dispute = await prisma.$transaction(async (tx) => {
        const created = await tx.dispute.create({
          data: { roomId, categoryGroup: resolvedCategory.toUpperCase() as PrismaCategoryGroup, title, description, sourceConversationId, status: 'WAITING_OPPONENT' },
        })
        const participant = await tx.disputeParticipant.create({
          data: { disputeId: created.id, userId, role: 'ROLE_A' },
        })
        const statement = await tx.disputeStatement.create({
          data: { disputeId: created.id, participantId: participant.id, userId, role: 'ROLE_A', content, moderationStatus: moderationSucceeded ? 'approved' : 'pending', submittedAt: new Date() },
        })
        if (moderationSucceeded) {
          await tx.moderationLog.create({
            data: { roomId, conversationId: sourceConversationId ?? null, disputeId: created.id, statementId: statement.id, userId, target: 'STATEMENT', isBlocked: false, reason: null, confidenceScore: moderation.confidenceScore, durationMs: moderation.durationMs, modelName: moderation.modelName },
          })
        }
        return created
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })

      return NextResponse.json<ApiResponse<DisputeResult>>(
        { success: true, data: { id: dispute.id, hasPersonalInfo: moderation.hasPersonalInfo } },
        { status: 201 },
      )
    }

    // ── 케이스 B: 기존 사건에 진술 저장 (상대방 참여 또는 수정) ──
    const participant = existingDispute.participants.find((p) => p.userId === userId)
    if (!participant) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'FORBIDDEN', message: '해당 사건의 참여자가 아닙니다.' } },
        { status: 403 },
      )
    }

    const immutableStatuses: DisputeStatus[] = ['JUDGING', 'JUDGED', 'CLOSED', 'DELETED', 'EXPIRED']
    if (immutableStatuses.includes(existingDispute.status)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'CONFLICT', message: '현재 상태에서는 진술을 수정할 수 없습니다.' } },
        { status: 409 },
      )
    }

    const existingStatement = participant.statements[0] ?? null
    const isNew = !existingStatement

    let newDisputeStatus: DisputeStatus | null = null
    if (participant.role === 'ROLE_A' && existingDispute.status === 'DRAFT') newDisputeStatus = 'WAITING_OPPONENT'
    else if (participant.role === 'ROLE_B' && existingDispute.status === 'OPPONENT_JOINED') newDisputeStatus = 'BOTH_SUBMITTED'

    let moderation = { isBlocked: false, hasPersonalInfo: false, confidenceScore: null as number | null, durationMs: null as number | null, modelName: null as string | null, reason: null as string | null }
    let moderationSucceeded = false
    try {
      moderation = await moderateContent(content)
      moderationSucceeded = true
    } catch (err) {
      console.error('[disputes] moderation failed', { message: err instanceof Error ? err.message : 'unknown' })
    }

    if (moderation.isBlocked) {
      await prisma.moderationLog.create({
        data: { roomId, conversationId: existingDispute.sourceConversationId, disputeId: existingDispute.id, userId, target: 'STATEMENT', isBlocked: true, reason: moderation.reason, confidenceScore: moderation.confidenceScore, durationMs: moderation.durationMs, modelName: moderation.modelName },
      })
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'CONTENT_BLOCKED', message: moderation.reason ?? '부적절한 표현이 포함되어 있습니다. 내용을 수정해주세요.' } },
        { status: 422 },
      )
    }

    let disputeMeta: { title: string; description: string } | null = null
    if (participant.role === 'ROLE_A' && isNew) {
      try {
        const meta = await withTimeout(extractDisputeMeta(content), 30000, 'extractDisputeMeta')
        disputeMeta = { title: meta.title, description: meta.summary }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('timeout')) return NextResponse.json<ApiResponse>({ success: false, error: { code: 'AI_EXTRACTION_TIMEOUT', message: 'AI 분석 시간이 초과됐습니다. 다시 시도해주세요.' } }, { status: 504 })
        if (msg.includes('JSON')) return NextResponse.json<ApiResponse>({ success: false, error: { code: 'AI_EXTRACTION_PARSE_ERROR', message: 'AI 응답 처리 중 오류가 발생했습니다. 다시 시도해주세요.' } }, { status: 502 })
        return NextResponse.json<ApiResponse>({ success: false, error: { code: 'AI_EXTRACTION_FAILED', message: 'AI 분석에 실패했습니다. 다시 시도해주세요.' } }, { status: 503 })
      }
    }

    const statement = await prisma.$transaction(async (tx) => {
      const stmt = isNew
        ? await tx.disputeStatement.create({ data: { disputeId: existingDispute.id, participantId: participant.id, userId, role: participant.role, content, moderationStatus: moderationSucceeded ? 'approved' : 'pending', submittedAt: new Date() } })
        : await tx.disputeStatement.update({ where: { id: existingStatement.id }, data: { content, moderationStatus: moderationSucceeded ? 'approved' : 'pending', submittedAt: new Date() } })

      if (moderationSucceeded) {
        await tx.moderationLog.create({
          data: { roomId, conversationId: existingDispute.sourceConversationId, disputeId: existingDispute.id, statementId: stmt.id, userId, target: 'STATEMENT', isBlocked: false, reason: null, confidenceScore: moderation.confidenceScore, durationMs: moderation.durationMs, modelName: moderation.modelName },
        })
      }

      await tx.dispute.update({
        where: { id: existingDispute.id },
        data: {
          ...(newDisputeStatus ? { status: newDisputeStatus } : {}),
          ...(disputeMeta ? { title: disputeMeta.title, description: disputeMeta.description } : {}),
        },
      })

      return stmt
    })

    return NextResponse.json<ApiResponse<DisputeResult>>(
      { success: true, data: { id: existingDispute.id, hasPersonalInfo: moderation.hasPersonalInfo } },
      { status: isNew ? 201 : 200 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[disputes] POST error', { message })
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
