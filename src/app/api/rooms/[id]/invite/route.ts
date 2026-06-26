import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getRequestUserId } from '@/lib/auth/session'
import { generateInviteToken, hashInviteToken, getInviteExpiresAt } from '@/lib/invite'
import type { ApiResponse } from '@/types/common'

interface InviteResponse {
  inviteUrl: string
  expiresAt: string
}

// POST /api/rooms/:id/invite
// 초대 링크 발급. room_mode → invite_ready 전환
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getRequestUserId(request)
  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    )
  }

  const { id } = await params

  try {
    const room = await prisma.disputeRoom.findFirst({
      where: { id, deletedAt: null },
    })

    if (!room) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NOT_FOUND', message: '방을 찾을 수 없습니다.' } },
        { status: 404 },
      )
    }

    if (room.creatorUserId !== userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'FORBIDDEN', message: '초대 링크를 발급할 권한이 없습니다.' } },
        { status: 403 },
      )
    }

    if (room.roomMode !== 'AI_ROOM' && room.roomMode !== 'INVITE_READY') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'INVALID_STATUS', message: '초대 링크를 발급할 수 없는 상태입니다.' } },
        { status: 422 },
      )
    }

    const token = generateInviteToken()
    const tokenHash = hashInviteToken(token)
    const expiresAt = getInviteExpiresAt()

    await prisma.$transaction(async (tx) => {
      await tx.disputeRoom.update({
        where: { id },
        data: {
          roomTokenHash: tokenHash,
          inviteCreatedAt: new Date(),
          expiresAt,
          roomMode: 'INVITE_READY',
        },
      })

      const existingDispute = await tx.dispute.findFirst({
        where: { roomId: id },
      })

      if (existingDispute && existingDispute.status === 'DRAFT') {
        await tx.dispute.update({
          where: { id: existingDispute.id },
          data: { status: 'WAITING_OPPONENT' },
        })
      }
    })

    const appUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      (process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3030')

    if (!appUrl) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'CONFIG_ERROR', message: '서비스 URL 설정이 누락되었습니다.' } },
        { status: 500 },
      )
    }

    const inviteUrl = new URL(`/join/${token}`, appUrl).toString()

    return NextResponse.json<ApiResponse<InviteResponse>>(
      { success: true, data: { inviteUrl, expiresAt: expiresAt.toISOString() } },
      { status: 201 },
    )
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
