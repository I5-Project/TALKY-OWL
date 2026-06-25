import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { getRequestUserId } from '@/lib/auth/session'
import type { ApiResponse } from '@/types/common'
import type { GiftItemDto } from '@/types/gift'

type GiftRow = {
  id: string
  item_name: string
  price_range: string | null
  image_url: string | null
  reason: string | null
}

function toDto(row: GiftRow): GiftItemDto {
  return {
    id: row.id,
    itemName: row.item_name,
    priceRange: row.price_range,
    imageUrl: row.image_url,
    reason: row.reason,
  }
}

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

  const participant = await prisma.disputeParticipant.findFirst({
    where: { disputeId: id, userId },
  })
  if (!participant) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다.' } },
      { status: 403 },
    )
  }

  const { searchParams } = new URL(request.url)
  const gender = searchParams.get('gender') ?? ''
  const age = parseInt(searchParams.get('age') ?? '0', 10)
  const mbti = searchParams.get('mbti') ?? ''

  const normalizedGender = gender === 'male' || gender === 'female' ? gender : null
  // 20대 , 30대 ,40대 이상
  const ageGroup = age < 30 ? 20 : age < 40 ? 30 : 40
  const normalizedMbti = mbti.length === 4 ? mbti.toUpperCase() : null

  try {
    const genderCond = normalizedGender
      ? Prisma.sql`(target_gender = ${normalizedGender} OR target_gender IS NULL)`
      : Prisma.sql`target_gender IS NULL`

    const ageCond = Prisma.sql`(target_age_group = ${ageGroup} OR target_age_group IS NULL)`

    const mbtiCond = normalizedMbti
      ? Prisma.sql`(target_mbti = ${normalizedMbti} OR target_mbti IS NULL)`
      : Prisma.sql`target_mbti IS NULL`

    const rows = await prisma.$queryRaw<GiftRow[]>`
      SELECT id, item_name, price_range, image_url, reason
      FROM gift_recommendation_items
      WHERE is_active = true
        AND recommendation_id IS NULL
        AND ${genderCond}
        AND ${ageCond}
        AND ${mbtiCond}
      LIMIT 50
    `

    if (rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'GIFT_NOT_FOUND', message: '추천 선물을 찾을 수 없습니다.' } },
        { status: 404 },
      )
    }

    const picked = rows[Math.floor(Math.random() * rows.length)]
    return NextResponse.json<ApiResponse<GiftItemDto>>({ success: true, data: toDto(picked) })
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
