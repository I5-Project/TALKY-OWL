import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSessionUserId } from '@/lib/auth/session'
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

    if (room.roomMode !== 'AI_CHAT') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'INVALID_STATUS', message: 'AI 대화방 상태에서만 초대 링크를 발급할 수 있습니다.' } },
        { status: 422 },
      )
    }

    const token = generateInviteToken()
    const tokenHash = hashInviteToken(token)
    const expiresAt = getInviteExpiresAt()

    await prisma.disputeRoom.update({
      where: { id },
      data: {
        roomTokenHash: tokenHash,
        inviteCreatedAt: new Date(),
        expiresAt,
        roomMode: 'INVITE_READY',
      },
    })

    prisma.auditLog.create({
      data: { eventType: 'INVITE_LINK_CREATED', actorUserId: userId, roomId: id },
    }).catch(() => {})

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3030'
    const inviteUrl = `${appUrl}/join/${token}`

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
