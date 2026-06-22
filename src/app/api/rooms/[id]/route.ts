import { NextRequest, NextResponse } from 'next/server'
import { type RoomMode as PrismaRoomMode, type CategoryGroup as PrismaCategoryGroup } from '@prisma/client'
import { prisma } from '@/lib/db'
import { getRequestUserId } from '@/lib/auth/session'
import type { ApiResponse, CategoryGroup } from '@/types/common'
import type { RoomDto, RoomMode } from '@/types/room'

function toRoomDto(room: {
  id: string
  roomNo: string
  creatorUserId: string
  categoryGroup: PrismaCategoryGroup
  roomMode: PrismaRoomMode
  inviteCreatedAt: Date | null
  expiresAt: Date | null
  closedAt: Date | null
  createdAt: Date
  updatedAt: Date
}): RoomDto {
  return {
    id: room.id,
    roomNo: room.roomNo,
    creatorUserId: room.creatorUserId,
    categoryGroup: room.categoryGroup.toLowerCase() as CategoryGroup,
    roomMode: room.roomMode.toLowerCase() as RoomMode,
    inviteCreatedAt: room.inviteCreatedAt?.toISOString() ?? null,
    expiresAt: room.expiresAt?.toISOString() ?? null,
    closedAt: room.closedAt?.toISOString() ?? null,
    createdAt: room.createdAt.toISOString(),
    updatedAt: room.updatedAt.toISOString(),
  }
}

function hasAccess(room: { creatorUserId: string; roomMode: PrismaRoomMode; dispute: { participants: { userId: string }[] } | null }, userId: string): boolean {
  if (room.roomMode === 'AI_ROOM' || room.roomMode === 'INVITE_READY') {
    return room.creatorUserId === userId
  }
  return (
    room.creatorUserId === userId ||
    (room.dispute?.participants.some((p) => p.userId === userId) ?? false)
  )
}

// GET /api/rooms/:id
// 방 상세 조회
export async function GET(
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
      include: { dispute: { include: { participants: true } } },
    })
    if (!room) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'ROOM_NOT_FOUND', message: '방을 찾을 수 없습니다.' } },
        { status: 404 },
      )
    }

    if (!hasAccess(room, userId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'FORBIDDEN', message: '이 방에 접근할 권한이 없습니다.' } },
        { status: 403 },
      )
    }

    return NextResponse.json<ApiResponse<RoomDto>>({ success: true, data: toRoomDto(room) })
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}

// DELETE /api/rooms/:id
// 방 소프트 삭제. 생성자만 삭제 가능
export async function DELETE(
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
        { success: false, error: { code: 'ROOM_NOT_FOUND', message: '방을 찾을 수 없습니다.' } },
        { status: 404 },
      )
    }

    if (room.creatorUserId !== userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'FORBIDDEN', message: '방을 삭제할 권한이 없습니다.' } },
        { status: 403 },
      )
    }

    await prisma.disputeRoom.update({
      where: { id },
      data: { deletedAt: new Date(), roomMode: 'DELETED' },
    })

    return NextResponse.json<ApiResponse>({ success: true })
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
