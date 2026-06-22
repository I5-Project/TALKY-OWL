'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchDiariesByDate } from './diary.api'

export const diaryKeys = {
  byDate: (date: string) => ['diary', 'byDate', date] as const,
}

export function useDiariesByDate(date: string) {
  return useQuery({
    queryKey: diaryKeys.byDate(date),
    queryFn: () => fetchDiariesByDate(date),
    enabled: !!date,
    staleTime: 1000 * 60 * 5,
  })
}
