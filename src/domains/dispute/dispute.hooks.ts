'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchDispute, fetchCompletedCases, saveStatement, submitStatement, requestJudgment, closeDispute } from './dispute.api'
import type { CategoryGroup } from '@/types/common'

export const disputeKeys = {
  detail: (id: string) => ['dispute', id] as const,
  completedList: (categoryGroup?: CategoryGroup) => ['disputes', 'completed', categoryGroup ?? 'all'] as const,
}

export function useCompletedCases(categoryGroup?: CategoryGroup) {
  return useQuery({
    queryKey: disputeKeys.completedList(categoryGroup),
    queryFn: () => fetchCompletedCases(categoryGroup),
    staleTime: 1000 * 60,
  })
}

export function useDispute(disputeId: string) {
  return useQuery({
    queryKey: disputeKeys.detail(disputeId),
    queryFn: () => fetchDispute(disputeId),
    enabled: !!disputeId,
  })
}

export function useSaveStatement(disputeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => saveStatement(disputeId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(disputeId) })
    },
  })
}

export function useSubmitStatement(disputeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => submitStatement(disputeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(disputeId) })
    },
  })
}

export function useRequestJudgment(disputeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => requestJudgment(disputeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(disputeId) })
    },
  })
}

export function useCloseDispute(disputeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => closeDispute(disputeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(disputeId) })
    },
  })
}
