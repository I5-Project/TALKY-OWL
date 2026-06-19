'use client'

import { useQuery } from '@tanstack/react-query'
import type { CategoryGroup } from '@/types/common'

type Participant = {
  role: 'role_a' | 'role_b'
  user: {
    nickname: string | null
    profileImageUrl: string | null
  }
}

export type ActiveCase = {
  id: string
  categoryGroup: CategoryGroup
  title: string
  description: string | null
  createdAt: string
  participants: Participant[]
}

// 진행중인 사건 = 진술 시작 후 ~ 판결 전
// draft(진술 전), judging(판결 처리 중), judged(판결 완료) 제외
const ACTIVE_DISPUTE_STATUSES = ['waiting_opponent', 'opponent_joined', 'both_submitted'] as const
type ActiveDisputeStatus = (typeof ACTIVE_DISPUTE_STATUSES)[number]

type RawCase = ActiveCase & { status: ActiveDisputeStatus }

// TODO: 진행중인 사건 API 연동 시 활성화
// async function fetchActiveCases(): Promise<ActiveCase[]> {
//   const res = await fetch('/api/disputes?active=true')
//   if (!res.ok) throw new Error('진행중인 사건을 불러오지 못했습니다.')
//   const json = await res.json()
//   return json.data.disputes
// }

export function useActiveCases() {
  return useQuery({
    queryKey: ['disputes', 'active'],
    queryFn: async (): Promise<ActiveCase[]> => [],
    staleTime: 1000 * 60,
  })
}
