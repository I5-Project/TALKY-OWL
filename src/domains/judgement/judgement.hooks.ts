'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchJudgment } from './judgement.api'

export const judgementKeys = {
  detail: (disputeId: string) => ['judgement', disputeId] as const,
}

export function useJudgment(disputeId: string) {
  return useQuery({
    queryKey: judgementKeys.detail(disputeId),
    queryFn: () => fetchJudgment(disputeId),
    enabled: !!disputeId,
  })
}
