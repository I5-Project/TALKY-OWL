'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchDispute, saveStatement, submitStatement, requestJudgment } from './dispute.api'

export const disputeKeys = {
  detail: (id: string) => ['dispute', id] as const,
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
