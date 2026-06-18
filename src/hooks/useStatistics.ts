'use client'

import { useQuery } from '@tanstack/react-query'

type CategoryItem = {
  category: 'ROMANCE' | 'FAMILY' | 'FRIEND' | 'WORK'
  count: number
}

export type CategoryStat = CategoryItem & {
  percentage: number
}

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

      // 카테고리별 비율 계산 (소수점 1자리)
      const stats: CategoryStat[] = items.map((item) => ({
        ...item,
        percentage: total > 0 ? Math.round((item.count / total) * 1000) / 10 : 0,
      }))

      return { items: stats, total }
    },
    staleTime: 1000 * 60 * 60 * 24, // 서버 revalidate(86400s)와 맞춤
  })
}
