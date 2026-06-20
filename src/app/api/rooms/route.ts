import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { type RoomMode as PrismaRoomMode, type CategoryGroup as PrismaCategoryGroup } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSessionUserId } from '@/lib/auth/session'
import { VALID_CATEGORY_GROUPS } from '@/lib/constants/dispute'
import type { ApiResponse, CategoryGroup } from '@/types/common'
import type { RoomDto, RoomListResponse, RoomMode } from '@/types/room'

const createRoomSchema = z.object({
  categoryGroup: z.enum(VALID_CATEGORY_GROUPS, {
    errorMap: () => ({ message: '카테고리는 romance, family, friend, work 중 하나여야 합니다.' }),
  }),
})

function generateRoomNo(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `R-${date}-${random}`
}

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

// GET /api/rooms
// 내가 생성하거나 참여한 방 목록 조회
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    )
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10) || 20))

  // ai_chat/invite_ready: creator 기준, one_to_one 이후: 참여자 기준
  const where = {
    deletedAt: null,
    OR: [
      { creatorUserId: userId },
      { dispute: { participants: { some: { userId } } } },
    ],
  }

  try {
    const [rooms, total] = await prisma.$transaction([
      prisma.disputeRoom.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.disputeRoom.count({ where }),
    ])

    return NextResponse.json<ApiResponse<RoomListResponse>>({
      success: true,
      data: { rooms: rooms.map(toRoomDto), total, page, limit },
    })
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}

// POST /api/rooms
// 방 생성. 기본 roomMode = ai_room
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
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

  const parsed = createRoomSchema.safeParse(body)
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

  const { categoryGroup } = parsed.data

  try {
    const room = await prisma.disputeRoom.create({
      data: {
        roomNo: generateRoomNo(),
        creatorUserId: userId,
        categoryGroup: categoryGroup.toUpperCase() as PrismaCategoryGroup,
        roomMode: 'AI_ROOM',
      },
    })

    return NextResponse.json<ApiResponse<RoomDto>>(
      { success: true, data: toRoomDto(room) },
      { status: 201 },
    )
  } catch (error) {
    console.error('[rooms] POST error', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
