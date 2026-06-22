'use client'

import { useQuery } from '@tanstack/react-query'

type CategoryItem = {
  category: 'ROMANCE' | 'FAMILY' | 'FRIEND' | 'WORK'
  count: number
}

export type CategoryStat = CategoryItem & {
  percentage: number
}

// TODO: 실제 데이터 쌓이면 제거
const MOCK_ITEMS: CategoryItem[] = [
  { category: 'FRIEND', count: 7 },
  { category: 'ROMANCE', count: 5 },
  { category: 'WORK', count: 4 },
  { category: 'FAMILY', count: 3 },
]

async function fetchCategoryStats() {
  const res = await fetch('/api/statistics/categories')
  if (!res.ok) throw new Error('통계 데이터를 불러오지 못했습니다.')
  const json = await res.json()
  return json.data as { items: CategoryItem[]; total: number }
}

export function useStatistics() {
  return useQuery({
    queryKey: ['statistics', 'categories'],
    queryFn: async () => {
      const { items, total } = await fetchCategoryStats()

      const source = total === 0 ? MOCK_ITEMS : items
      const mockTotal = MOCK_ITEMS.reduce((s, i) => s + i.count, 0)
      const resolvedTotal = total === 0 ? mockTotal : total

      // 카테고리별 비율 계산 (소수점 1자리)
      const stats: CategoryStat[] = source.map((item) => ({
        ...item,
        percentage: Math.round((item.count / resolvedTotal) * 1000) / 10,
      }))

      return { items: stats, total: resolvedTotal }
    },
    staleTime: 1000 * 60 * 60 * 24, // 서버 revalidate(86400s)와 맞춤
  })
}
