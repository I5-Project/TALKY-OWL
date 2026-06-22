'use client'

import { useQuery } from '@tanstack/react-query'
import type { CategoryGroup } from '@/types/common'
import type { DisputeListResponse, DisputeDto } from '@/types/dispute'

// ActiveCasesSection 컴포넌트가 기대하는 participant 형태
// API 응답(DisputeParticipantDto)은 profileImageUrl/nickname이 flat하게 있지만
// 컴포넌트는 user.profileImageUrl처럼 nested 구조를 사용하므로 변환이 필요함
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

// DisputeDto(API 응답) → ActiveCase(컴포넌트 타입) 변환
// API의 flat 구조를 컴포넌트가 기대하는 nested user 구조로 맞춰줌
function toActiveCase(dto: DisputeDto): ActiveCase {
  return {
    id: dto.id,
    categoryGroup: dto.categoryGroup,
    title: dto.title,
    description: dto.description,
    createdAt: dto.createdAt,
    participants: dto.participants.map((p) => ({
      role: p.role,
      user: {
        nickname: p.name,
        profileImageUrl: p.profileImageUrl,
      },
    })),
  }
}

async function fetchActiveCases(): Promise<ActiveCase[]> {
  // active=true: 서버에서 진행중 상태(waiting_opponent, opponent_joined, both_submitted, judging)만 필터링
  const res = await fetch('/api/disputes?active=true')
  if (!res.ok) throw new Error('진행중인 사건을 불러오지 못했습니다.')

  const json: { data: DisputeListResponse } = await res.json()

  // API가 이미 createdAt 기준 최신순 정렬로 내려주므로 클라이언트 재정렬 불필요
  return json.data.disputes.map(toActiveCase)
}

export function useActiveCases() {
  return useQuery({
    queryKey: ['disputes', 'active'],
    queryFn: fetchActiveCases,
    // 1분간 캐시 유지 — 홈 재진입 시 불필요한 재요청 방지
    staleTime: 1000 * 60,
  })
}
