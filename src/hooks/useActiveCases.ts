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

// TODO: 실 API 연동 시 아래 mock 제거 후 fetch 함수로 교체
// async function fetchActiveCases(): Promise<ActiveCase[]> {
//   const res = await fetch('/api/disputes?active=true')
//   if (!res.ok) throw new Error('진행중인 사건을 불러오지 못했습니다.')
//   const json = await res.json()
//   return json.data.disputes
// }

const MOCK_RAW: RawCase[] = [
  {
    id: 'mock-1',
    categoryGroup: 'romance',
    title: '술주정 사건',
    description: '제세자 술을 아주 구매하는데 남편은 술을 너무 좋아해서 벌어진 사건',
    status: 'waiting_opponent',
    createdAt: '2026-06-13T00:00:00Z',
    participants: [
      { role: 'role_a', user: { nickname: '근욱', profileImageUrl: null } },
    ],
  },
  {
    id: 'mock-2',
    categoryGroup: 'work',
    title: '사내왕따 사건',
    description: '신입사원인 제보자가 준법을 하고싶어서 유가를 말했는데 회사분위기 김생쪽에서 나간 사건',
    status: 'opponent_joined',
    createdAt: '2026-06-11T00:00:00Z',
    participants: [
      { role: 'role_a', user: { nickname: '사내', profileImageUrl: null } },
      { role: 'role_b', user: { nickname: '왕따', profileImageUrl: null } },
    ],
  },
]

export function useActiveCases() {
  return useQuery({
    queryKey: ['disputes', 'active'],
    queryFn: async (): Promise<ActiveCase[]> => {
      // TODO: 실 API 연동 시 아래 mock 로직 제거 후 fetchActiveCases()로 교체
      const active = MOCK_RAW.filter((c) =>
        (ACTIVE_DISPUTE_STATUSES as readonly string[]).includes(c.status),
      )
      return active.map(({ status: _status, ...rest }) => rest)
    },
    staleTime: 1000 * 60,
  })
}
