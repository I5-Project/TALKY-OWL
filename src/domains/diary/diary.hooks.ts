'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { createDiary, deleteDiary, fetchDiariesByDate, updateDiary } from './diary.api'

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

export function useCreateDiary() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: createDiary,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: diaryKeys.byDate(variables.diaryDate) })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      router.push('/calendar')
    },
  })
}

export function useUpdateDiary(diaryDate: string) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { title: string; content: string; emotionType: string } }) =>
      updateDiary(id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: diaryKeys.byDate(diaryDate) })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      router.push(`/diary/${variables.id}`)
    },
  })
}

export function useDeleteDiary(diaryDate: string) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: deleteDiary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diaryKeys.byDate(diaryDate) })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      router.push('/calendar')
    },
  })
}
