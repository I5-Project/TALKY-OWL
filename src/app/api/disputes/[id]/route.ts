import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { type Prisma, type CategoryGroup as PrismaCategoryGroup } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSessionUserId } from '@/lib/auth/session'
import { VALID_CATEGORY_GROUPS, IMMUTABLE_DISPUTE_STATUSES } from '@/lib/constants/dispute'
import type { ApiResponse, CategoryGroup } from '@/types/common'
import type { DisputeDto, DisputeParticipantDto, DisputeStatementDto } from '@/types/dispute'

const updateDisputeSchema = z
  .object({
    title: z
      .string()
      .min(1, '제목을 입력해주세요.')
      .max(200, '제목은 200자 이하로 입력해주세요.')
      .optional(),
    // null을 허용하여 기존에 설정된 description을 지울 수 있음
    description: z.string().nullable().optional(),
    categoryGroup: z
      .enum(VALID_CATEGORY_GROUPS, {
        errorMap: () => ({ message: '카테고리는 romance, family, friend, work 중 하나여야 합니다.' }),
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).some((k) => data[k as keyof typeof data] !== undefined), {
    message: '수정할 항목을 하나 이상 입력해주세요.',
  })

type DisputeForDetail = Prisma.DisputeGetPayload<{
  include: {
    participants: { include: { user: { select: { profileImageUrl: true } } } }
    statements: true
  }
}>

function toParticipantDto(p: DisputeForDetail['participants'][number]): DisputeParticipantDto {
  return {
    id: p.id,
    disputeId: p.disputeId,
    userId: p.userId,
    role: p.role.toLowerCase() as DisputeParticipantDto['role'],
    nickname: null,
    profileImageUrl: p.user.profileImageUrl ?? null,
    joinedAt: p.joinedAt.toISOString(),
    createdAt: p.createdAt.toISOString(),
  }
}

function toStatementDto(s: DisputeForDetail['statements'][number]): DisputeStatementDto {
  return {
    id: s.id,
    disputeId: s.disputeId,
    participantId: s.participantId,
    userId: s.userId,
    role: s.role.toLowerCase() as DisputeStatementDto['role'],
    content: s.content,
    moderationStatus: s.moderationStatus,
    submittedAt: s.submittedAt?.toISOString() ?? null,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }
}

function toDisputeDto(dispute: DisputeForDetail): DisputeDto {
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
    statements: dispute.statements.map(toStatementDto),
  }
}

// GET /api/disputes/:id
// 사건 상세 조회. 참여자(role_a / role_b)만 조회 가능
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    )
  }

  const { id } = await params

  try {
    // 존재 확인 + 권한 확인을 단일 쿼리로 처리
    const dispute = await prisma.dispute.findFirst({
      where: {
        id,
        deletedAt: null,
        participants: { some: { userId } },
      },
      include: {
        participants: { include: { user: { select: { profileImageUrl: true } } } },
        statements: true,
      },
    })

    if (!dispute) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'DISPUTE_NOT_FOUND', message: '사건을 찾을 수 없습니다.' } },
        { status: 404 },
      )
    }

    return NextResponse.json<ApiResponse<DisputeDto>>({
      success: true,
      data: toDisputeDto(dispute),
    })
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}

// PATCH /api/disputes/:id
// 사건 수정. role_a만 수정 가능. both_submitted 이후 상태에서는 수정 불가
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    )
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INVALID_REQUEST', message: '요청 본문을 파싱할 수 없습니다.' } },
      { status: 400 },
    )
  }

  const parsed = updateDisputeSchema.safeParse(body)
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

  try {
    // 존재 확인 먼저, 권한 확인은 그 이후 (정보 노출 방지)
    const dispute = await prisma.dispute.findFirst({
      where: { id, deletedAt: null },
      include: { participants: true, statements: true },
    })
    if (!dispute) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'DISPUTE_NOT_FOUND', message: '사건을 찾을 수 없습니다.' } },
        { status: 404 },
      )
    }

    const isRoleA = dispute.participants.some((p) => p.userId === userId && p.role === 'ROLE_A')
    if (!isRoleA) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'FORBIDDEN', message: '사건을 수정할 권한이 없습니다.' } },
        { status: 403 },
      )
    }

    if (IMMUTABLE_DISPUTE_STATUSES.includes(dispute.status as (typeof IMMUTABLE_DISPUTE_STATUSES)[number])) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'DISPUTE_NOT_MODIFIABLE',
            message: '현재 상태에서는 사건을 수정할 수 없습니다.',
            details: `현재 사건 상태: ${dispute.status.toLowerCase()}`,
          },
        },
        { status: 422 },
      )
    }

    const { title, description, categoryGroup } = parsed.data
    const updated = await prisma.dispute.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(categoryGroup !== undefined && {
          categoryGroup: categoryGroup.toUpperCase() as PrismaCategoryGroup,
        }),
      },
      include: {
        participants: { include: { user: { select: { profileImageUrl: true } } } },
        statements: true,
      },
    })

    return NextResponse.json<ApiResponse<DisputeDto>>({
      success: true,
      data: toDisputeDto(updated),
    })
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}

// DELETE /api/disputes/:id
// 사건 소프트 삭제. 참여자만 삭제 가능
// TODO: 삭제 권한 기준 확정 필요 (docs/domains/DISPUTE.md 11항)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    )
  }

  const { id } = await params

  try {
    // 존재 확인 먼저, 권한 확인은 그 이후 (정보 노출 방지)
    const dispute = await prisma.dispute.findFirst({
      where: { id, deletedAt: null },
      include: { participants: true },
    })
    if (!dispute) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'DISPUTE_NOT_FOUND', message: '사건을 찾을 수 없습니다.' } },
        { status: 404 },
      )
    }

    const isParticipant = dispute.participants.some((p) => p.userId === userId)
    if (!isParticipant) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'FORBIDDEN', message: '사건을 삭제할 권한이 없습니다.' } },
        { status: 403 },
      )
    }

    await prisma.dispute.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DELETED' },
    })

    return NextResponse.json<ApiResponse>({ success: true })
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
