'use client'

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { fetchDispute, fetchCompletedCases, saveStatement, submitStatement, requestJudgment, closeDispute } from './dispute.api'
import type { CategoryGroup } from '@/types/common'
import type { DisputeDto } from '@/types/dispute'

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

export function useDispute(
  disputeId: string,
  options?: Pick<UseQueryOptions<DisputeDto>, 'refetchInterval'>,
) {
  return useQuery({
    queryKey: disputeKeys.detail(disputeId),
    queryFn: () => fetchDispute(disputeId),
    enabled: !!disputeId,
    refetchInterval: options?.refetchInterval,
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
