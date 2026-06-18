import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { type CategoryGroup as PrismaCategoryGroup } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSessionUserId } from '@/lib/auth/session'
import { hashInviteToken, isInviteExpired } from '@/lib/invite'
import type { ApiResponse } from '@/types/common'

interface JoinResponse {
  roomId: string
  disputeId: string
  role: 'role_b'
}

// POST /api/rooms/:id/join
// 초대 토큰 검증 후 방 참여. role_a/role_b 확정, dispute 생성, room_mode → one_to_one
export async function POST(
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
      { success: false, error: { code: 'VALIDATION_ERROR', message: '요청 본문을 파싱할 수 없습니다.' } },
      { status: 400 },
    )
  }

  const token = (body as { token?: unknown })?.token
  if (!token || typeof token !== 'string') {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'token이 필요합니다.' } },
      { status: 400 },
    )
  }

  try {
    const tokenHash = hashInviteToken(token)

    const room = await prisma.disputeRoom.findFirst({
      where: { id, roomTokenHash: tokenHash, deletedAt: null },
    })

    if (!room) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NOT_FOUND', message: '유효하지 않은 초대 링크입니다.' } },
        { status: 404 },
      )
    }

    if (room.roomMode === 'EXPIRED' || room.roomMode === 'DELETED' || room.roomMode === 'CLOSED') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'INVALID_STATUS', message: '만료되었거나 사용할 수 없는 초대 링크입니다.' } },
        { status: 422 },
      )
    }

    if (room.roomMode !== 'INVITE_READY') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'INVALID_STATUS', message: '참여할 수 없는 상태입니다.' } },
        { status: 422 },
      )
    }

    if (isInviteExpired(room.expiresAt)) {
      // 만료 처리 후 응답
      await prisma.disputeRoom.update({
        where: { id },
        data: { roomMode: 'EXPIRED' },
      })
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'INVALID_STATUS', message: '만료된 초대 링크입니다.' } },
        { status: 422 },
      )
    }

    // 생성자 본인 참여 차단
    if (room.creatorUserId === userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'FORBIDDEN', message: '본인이 만든 초대 링크로는 참여할 수 없습니다.' } },
        { status: 403 },
      )
    }

    // role_b 중복 참여 차단
    const existingDispute = await prisma.dispute.findFirst({
      where: { roomId: id },
      include: { participants: true },
    })
    if (existingDispute) {
      const hasRoleB = existingDispute.participants.some((p) => p.role === 'ROLE_B')
      if (hasRoleB) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: { code: 'CONFLICT', message: '이미 참여자가 존재하는 방입니다.' } },
          { status: 409 },
        )
      }
    }

    // 트랜잭션: dispute 생성 + role_a/role_b 등록 + room_mode → one_to_one
    const dispute = await prisma.$transaction(async (tx) => {
      let targetDispute = existingDispute

      if (!targetDispute) {
        targetDispute = await tx.dispute.create({
          data: {
            roomId: id,
            categoryGroup: room.categoryGroup as PrismaCategoryGroup,
            title: `${room.roomNo} 갈등 조정`,
            status: 'OPPONENT_JOINED',
          },
          include: { participants: true },
        })

        // role_a (생성자) 등록
        await tx.disputeParticipant.create({
          data: { disputeId: targetDispute.id, userId: room.creatorUserId, role: 'ROLE_A' },
        })
      } else {
        await tx.dispute.update({
          where: { id: targetDispute.id },
          data: { status: 'OPPONENT_JOINED' },
        })
      }

      // role_b (참여자) 등록
      await tx.disputeParticipant.create({
        data: { disputeId: targetDispute.id, userId, role: 'ROLE_B' },
      })

      // room_mode → one_to_one
      await tx.disputeRoom.update({
        where: { id },
        data: { roomMode: 'ONE_TO_ONE' },
      })

      return targetDispute
    })

    return NextResponse.json<ApiResponse<JoinResponse>>({
      success: true,
      data: { roomId: id, disputeId: dispute.id, role: 'role_b' },
    })
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
