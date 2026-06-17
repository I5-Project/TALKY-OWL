import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSessionUserId } from '@/lib/auth/session'
import type { ApiResponse } from '@/types/common'

const CLOSEABLE_MODES = ['AI_CHAT', 'INVITE_READY', 'ONE_TO_ONE'] as const

// POST /api/rooms/:id/close
// 방 종료. 생성자만 가능. closed/expired/deleted 상태에서는 불가
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
        { success: false, error: { code: 'ROOM_NOT_FOUND', message: '방을 찾을 수 없습니다.' } },
        { status: 404 },
      )
    }

    if (room.creatorUserId !== userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'FORBIDDEN', message: '방을 종료할 권한이 없습니다.' } },
        { status: 403 },
      )
    }

    if (!CLOSEABLE_MODES.includes(room.roomMode as (typeof CLOSEABLE_MODES)[number])) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'ROOM_NOT_CLOSEABLE',
            message: '현재 상태에서는 방을 종료할 수 없습니다.',
            details: `현재 방 상태: ${room.roomMode.toLowerCase()}`,
          },
        },
        { status: 422 },
      )
    }

    await prisma.disputeRoom.update({
      where: { id },
      data: { roomMode: 'CLOSED', closedAt: new Date() },
    })

    return NextResponse.json<ApiResponse>({ success: true })
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
