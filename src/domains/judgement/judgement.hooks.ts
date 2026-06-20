'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchJudgment } from './judgement.api'

export const judgementKeys = {
  detail: (disputeId: string) => ['judgement', disputeId] as const,
}

// enabled: judged/closed 상태일 때만 fetch하도록 외부에서 제어
export function useJudgment(disputeId: string, enabled = true) {
  return useQuery({
    queryKey: judgementKeys.detail(disputeId),
    queryFn: () => fetchJudgment(disputeId),
    enabled: !!disputeId && enabled,
  })
}
