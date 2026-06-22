import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { type Prisma, type CategoryGroup as PrismaCategoryGroup, DisputeStatus } from '@prisma/client'
import { prisma } from '@/lib/db'
import { getRequestUserId } from '@/lib/auth/session'
import { VALID_CATEGORY_GROUPS, COMPLETED_DISPUTE_STATUSES, CATEGORY_ACTIVE_LIMIT } from '@/lib/constants/dispute'
import type { ApiResponse, CategoryGroup } from '@/types/common'
import type { DisputeDto, DisputeParticipantDto, DisputeListResponse } from '@/types/dispute'

const createDisputeSchema = z.object({
  roomId: z.string().uuid('유효하지 않은 방 ID입니다.'),
  categoryGroup: z.enum(VALID_CATEGORY_GROUPS, {
    errorMap: () => ({ message: '카테고리는 romance, family, friend, work 중 하나여야 합니다.' }),
  }),
  title: z
    .string()
    .min(1, '제목을 입력해주세요.')
    .max(200, '제목은 200자 이하로 입력해주세요.'),
  description: z.string().optional(),
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
  const completed = searchParams.get('completed') === 'true'
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
    // completed=true 일 때 판결/종료 상태만 필터링 (사건기록 페이지)
    ...(completed && !rawStatus ? {
      status: { in: [...COMPLETED_DISPUTE_STATUSES] as DisputeStatus[] },
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
// 사건 생성. 활성 방(ai_chat, invite_ready, one_to_one)에서 생성 가능. 생성자는 role_a로 확정
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

  const { roomId, categoryGroup, title, description, sourceConversationId } = parsed.data

  try {
    const room = await prisma.disputeRoom.findFirst({
      where: { id: roomId, creatorUserId: userId, deletedAt: null },
    })
    if (!room) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'ROOM_NOT_FOUND', message: '방을 찾을 수 없습니다.' } },
        { status: 404 },
      )
    }

    if (room.roomMode === 'CLOSED' || room.roomMode === 'EXPIRED') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'ROOM_NOT_READY',
            message: '이미 종료되거나 만료된 방입니다.',
            details: `현재 방 상태: ${room.roomMode.toLowerCase()}`,
          },
        },
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

    // roomId는 DB unique 제약이 있어 소프트 삭제된 레코드도 포함해서 확인
    const existing = await prisma.dispute.findFirst({
      where: { roomId },
    })
    if (existing) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: 'DISPUTE_ALREADY_EXISTS', message: '이미 사건이 존재하는 방입니다.' },
        },
        { status: 409 },
      )
    }

    // 사건 생성 + role_a 참여자 등록 (원자적 처리)
    const dispute = await prisma.$transaction(async (tx) => {
      const created = await tx.dispute.create({
        data: {
          roomId,
          categoryGroup: categoryGroup.toUpperCase() as PrismaCategoryGroup,
          title,
          description,
          sourceConversationId,
          status: 'DRAFT',
        },
      })
      await tx.disputeParticipant.create({
        data: { disputeId: created.id, userId, role: 'ROLE_A' },
      })
      return tx.dispute.findUniqueOrThrow({
        where: { id: created.id },
        include: { participants: { include: { user: { select: { profileImageUrl: true, image: true } } } } },
      })
    })

    return NextResponse.json<ApiResponse<DisputeDto>>(
      { success: true, data: toDisputeDto(dispute) },
      { status: 201 },
    )
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
