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

class DuplicateDisputeError extends Error {
  constructor() { super('DISPUTE_ALREADY_EXISTS') }
}

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
  }),
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

// POST /api/disputes
// 사건 생성. content(진술)를 받아 AI 추출 → dispute 생성 → statement 저장까지 원자적 처리
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
    // 방 유효성 확인
    const room = await prisma.disputeRoom.findFirst({ where: { id: roomId, creatorUserId: userId, deletedAt: null } })

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

    const activeCount = await prisma.dispute.count({
      where: {
        categoryGroup: categoryGroup.toUpperCase() as PrismaCategoryGroup,
        deletedAt: null,
        status: { notIn: [...COMPLETED_DISPUTE_STATUSES] },
        participants: { some: { userId } },
      },
    })
    if (activeCount >= CATEGORY_ACTIVE_LIMIT) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'CATEGORY_LIMIT_EXCEEDED',
            message: '사건은 카테고리당 2개까지만\n생성이 가능합니다.',
          },
        },
        { status: 422 },
      )
    }

    // 모더레이션 + AI 추출 병렬 실행 (둘 다 타임아웃 적용)
    const [moderationResult, metaResult] = await Promise.allSettled([
      withTimeout(moderateContent(content), 8000, 'moderateContent'),
      withTimeout(extractDisputeMeta(content), 10000, 'extractDisputeMeta'),
    ])

    // 모더레이션 처리 (실패 시 fail open)
    let moderation = { isBlocked: false, hasPersonalInfo: false, confidenceScore: null as number | null, durationMs: null as number | null, modelName: null as string | null, reason: null as string | null }
    let moderationSucceeded = false
    if (moderationResult.status === 'fulfilled') {
      moderation = moderationResult.value
      moderationSucceeded = true
    } else {
      const reason = moderationResult.reason
      console.error('[disputes] moderation failed', {
        message: reason instanceof Error ? reason.message : 'unknown',
        userId,
        roomId,
      })
    }

    if (moderation.isBlocked) {
      console.info('[disputes] content blocked', {
        userId,
        roomId,
        isBlocked: true,
        confidenceScore: moderation.confidenceScore,
        modelName: moderation.modelName,
        reason: moderation.reason,
      })
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'CONTENT_BLOCKED', message: moderation.reason ?? '부적절한 표현이 포함되어 있습니다. 내용을 수정해주세요.' } },
        { status: 422 },
      )
    }

    // AI 추출 처리 (실패 시 에러 반환)
    if (metaResult.status === 'rejected') {
      const msg = metaResult.reason instanceof Error ? metaResult.reason.message : String(metaResult.reason)
      if (msg.includes('timeout')) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: { code: 'AI_EXTRACTION_TIMEOUT', message: 'AI 분석 시간이 초과됐습니다. 다시 시도해주세요.' } },
          { status: 504 },
        )
      }
      if (msg.includes('JSON')) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: { code: 'AI_EXTRACTION_PARSE_ERROR', message: 'AI 응답 처리 중 오류가 발생했습니다. 다시 시도해주세요.' } },
          { status: 502 },
        )
      }
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'AI_EXTRACTION_FAILED', message: 'AI 분석에 실패했습니다. 다시 시도해주세요.' } },
        { status: 503 },
      )
    }

    const { title, summary: description } = metaResult.value
    if (!title) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'AI_EXTRACTION_FAILED', message: 'AI가 사건 제목을 추출하지 못했습니다. 다시 시도해주세요.' } },
        { status: 503 },
      )
    }

    // dispute + 참여자 + 진술 원자적 생성 (중복 체크 포함, serializable로 race condition 방지)
    const dispute = await prisma.$transaction(async (tx) => {
      const existing = await tx.dispute.findFirst({ where: { roomId } })
      if (existing) throw new DuplicateDisputeError()

      const created = await tx.dispute.create({
        data: {
          roomId,
          categoryGroup: categoryGroup.toUpperCase() as PrismaCategoryGroup,
          title,
          description,
          sourceConversationId,
          status: 'WAITING_OPPONENT',
        },
      })
      const participant = await tx.disputeParticipant.create({
        data: { disputeId: created.id, userId, role: 'ROLE_A' },
      })
      const statement = await tx.disputeStatement.create({
        data: {
          disputeId: created.id,
          participantId: participant.id,
          userId,
          role: 'ROLE_A',
          content,
          moderationStatus: moderationSucceeded ? 'approved' : 'pending',
          submittedAt: new Date(),
        },
      })
      if (moderationSucceeded) {
        await tx.moderationLog.create({
          data: {
            roomId,
            conversationId: sourceConversationId ?? null,
            disputeId: created.id,
            statementId: statement.id,
            userId,
            target: 'STATEMENT',
            isBlocked: false,
            reason: null,
            confidenceScore: moderation.confidenceScore,
            durationMs: moderation.durationMs,
            modelName: moderation.modelName,
          },
        })
      }
      return tx.dispute.findUniqueOrThrow({
        where: { id: created.id },
        include: { participants: { include: { user: { select: { profileImageUrl: true, image: true } } } } },
      })
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })

    return NextResponse.json<ApiResponse<DisputeDto & { hasPersonalInfo: boolean }>>(
      { success: true, data: { ...toDisputeDto(dispute), hasPersonalInfo: moderation.hasPersonalInfo } },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof DuplicateDisputeError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'DISPUTE_ALREADY_EXISTS', message: '이미 사건이 존재하는 방입니다.' } },
        { status: 409 },
      )
    }
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
