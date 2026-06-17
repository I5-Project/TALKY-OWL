import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSessionUserId } from '@/lib/auth/session'
import { prisma } from '@/lib/db'
import type { ApiResponse } from '@/types/common'

// 하루에 한 번 재계산 (홈 화면 통계는 실시간 불필요)
export const revalidate = 86400

const ALL_CATEGORIES = ['ROMANCE', 'FAMILY', 'FRIEND', 'WORK'] as const

// GET /api/statistics/categories
// 판결 완료 사건 기준 카테고리별(연애/가족/친구/직장) count 반환
// 비율 계산은 프론트 훅(useStatistics)에서 처리
export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    )
  }

  try {
    const grouped = await prisma.dispute.groupBy({
      by: ['categoryGroup'],
      where: {
        status: 'JUDGED',
        deletedAt: null,
        anonymizedAt: null,
      },
      _count: { id: true },
    })

    const total = grouped.reduce((sum, g) => sum + g._count.id, 0)
    const countMap = new Map(grouped.map((g) => [g.categoryGroup, g._count.id]))

    // 4개 카테고리 모두 항상 포함 (데이터 없는 카테고리는 count 0)
    const items = ALL_CATEGORIES.map((category) => ({
      category,
      count: countMap.get(category) ?? 0,
    }))

    return NextResponse.json<ApiResponse<{ items: typeof items; total: number }>>({
      success: true,
      data: { items, total },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const isTimeout = /timeout|timed out/i.test(message)

    console.error('[statistics/categories] api error', { isTimeout, message })

    if (isTimeout) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'TIMEOUT', message: '요청 처리 시간이 초과되었습니다.' } },
        { status: 504 },
      )
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
