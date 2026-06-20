import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { type CategoryGroup as PrismaCategoryGroup } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSessionUserId } from '@/lib/auth/session'
import { hashInviteToken } from '@/lib/invite'
import type { ApiResponse } from '@/types/common'

interface JoinInfoResponse {
  roomId: string
  categoryGroup: string
  roomMode: string
  expiresAt: string | null
  inviterNickname: string | null
}

interface JoinResponse {
  roomId: string
  disputeId: string
  role: 'role_b'
}

// GET /api/rooms/join/:token
// 초대 토큰으로 방 정보 조회 (참여 확인 화면용)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    )
  }

  const { token } = await params

  try {
    const tokenHash = hashInviteToken(token)
    const room = await prisma.disputeRoom.findFirst({
      where: { roomTokenHash: tokenHash, deletedAt: null },
      include: { creator: { select: { nickname: true } } },
    })

    if (!room) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NOT_FOUND', message: '유효하지 않은 초대 링크입니다.' } },
        { status: 404 },
      )
    }

    if (room.roomMode === 'EXPIRED' || room.roomMode === 'DELETED' || room.roomMode === 'CLOSED') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'ROOM_UNAVAILABLE', message: '만료되었거나 사용할 수 없는 초대 링크입니다.' } },
        { status: 422 },
      )
    }

    if (room.roomMode !== 'INVITE_READY') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'ROOM_UNAVAILABLE', message: '참여할 수 없는 상태입니다.' } },
        { status: 422 },
      )
    }

    if (!room.expiresAt || room.expiresAt <= new Date()) {
      await prisma.disputeRoom.update({ where: { id: room.id }, data: { roomMode: 'EXPIRED' } })
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'INVITE_EXPIRED', message: '만료된 초대 링크입니다.' } },
        { status: 422 },
      )
    }

    if (room.creatorUserId === userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'FORBIDDEN', message: '본인이 만든 초대 링크로는 참여할 수 없습니다.' } },
        { status: 403 },
      )
    }

    return NextResponse.json<ApiResponse<JoinInfoResponse>>({
      success: true,
      data: {
        roomId: room.id,
        categoryGroup: room.categoryGroup.toLowerCase(),
        roomMode: room.roomMode.toLowerCase(),
        expiresAt: room.expiresAt?.toISOString() ?? null,
        inviterNickname: room.creator.nickname ?? null,
      },
    })
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}

// POST /api/rooms/join/:token
// 초대 토큰 검증 후 방 참여. role_a/role_b 확정, dispute 생성, room_mode → one_to_one
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    )
  }

  const { token } = await params

  try {
    const tokenHash = hashInviteToken(token)
    const room = await prisma.disputeRoom.findFirst({
      where: { roomTokenHash: tokenHash, deletedAt: null },
    })

    if (!room) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NOT_FOUND', message: '유효하지 않은 초대 링크입니다.' } },
        { status: 404 },
      )
    }

    if (room.roomMode === 'EXPIRED' || room.roomMode === 'DELETED' || room.roomMode === 'CLOSED') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'ROOM_UNAVAILABLE', message: '만료되었거나 사용할 수 없는 초대 링크입니다.' } },
        { status: 422 },
      )
    }

    if (room.roomMode !== 'INVITE_READY') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'ROOM_UNAVAILABLE', message: '참여할 수 없는 상태입니다.' } },
        { status: 422 },
      )
    }

    if (!room.expiresAt || room.expiresAt <= new Date()) {
      await prisma.disputeRoom.update({ where: { id: room.id }, data: { roomMode: 'EXPIRED' } })
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'INVITE_EXPIRED', message: '만료된 초대 링크입니다.' } },
        { status: 422 },
      )
    }

    if (room.creatorUserId === userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'FORBIDDEN', message: '본인이 만든 초대 링크로는 참여할 수 없습니다.' } },
        { status: 403 },
      )
    }

    const existingDispute = await prisma.dispute.findFirst({
      where: { roomId: room.id },
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

    const dispute = await prisma.$transaction(async (tx) => {
      let targetDispute = existingDispute

      if (!targetDispute) {
        targetDispute = await tx.dispute.create({
          data: {
            roomId: room.id,
            categoryGroup: room.categoryGroup as PrismaCategoryGroup,
            title: `${room.roomNo} 갈등 조정`,
            status: 'OPPONENT_JOINED',
          },
          include: { participants: true },
        })

        await tx.disputeParticipant.create({
          data: { disputeId: targetDispute.id, userId: room.creatorUserId, role: 'ROLE_A' },
        })
      } else {
        await tx.dispute.update({
          where: { id: targetDispute.id },
          data: { status: 'OPPONENT_JOINED' },
        })
        // WAITING_OPPONENT(초대 발급 시 설정)에서 OPPONENT_JOINED로 전환
      }

      await tx.disputeParticipant.create({
        data: { disputeId: targetDispute.id, userId, role: 'ROLE_B' },
      })

      await tx.disputeRoom.update({
        where: { id: room.id },
        data: { roomMode: 'ONE_TO_ONE' },
      })

      return targetDispute
    })

    return NextResponse.json<ApiResponse<JoinResponse>>({
      success: true,
      data: { roomId: room.id, disputeId: dispute.id, role: 'role_b' },
    })
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
