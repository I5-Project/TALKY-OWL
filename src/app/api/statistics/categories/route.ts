import { unstable_cache } from 'next/cache'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { ApiResponse } from '@/types/common'

// force-dynamic: 빌드 시 DB 호출 없음 (빌드 속도 개선)
// unstable_cache: 첫 요청 후 24시간 캐시 유지
export const dynamic = 'force-dynamic'

const ALL_CATEGORIES = ['ROMANCE', 'FAMILY', 'FRIEND', 'WORK'] as const

const getCategoryStats = unstable_cache(
  async () => {
    return prisma.dispute.groupBy({
      by: ['categoryGroup'],
      where: {
        status: 'JUDGED',
        deletedAt: null,
        anonymizedAt: null,
      },
      _count: { id: true },
    })
  },
  ['statistics-categories'],
  { revalidate: 86400 },
)

// GET /api/statistics/categories
// 판결 완료 사건 기준 카테고리별(연애/가족/친구/직장) count 반환
// 비율 계산은 프론트 훅(useStatistics)에서 처리
export async function GET() {
  try {
    const grouped = await getCategoryStats()

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
