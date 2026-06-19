'use client'

import { useQuery } from '@tanstack/react-query'
import type { ApiResponse } from '@/types/common'

interface UserMeData {
  id: string
  nickname: string | null
  mbti: string | null
}

async function fetchUserMe(): Promise<UserMeData | null> {
  const res = await fetch('/api/user/me')
  if (res.status === 401) return null
  if (!res.ok) throw new Error('사용자 정보를 불러오지 못했습니다.')
  const json: ApiResponse<UserMeData> = await res.json()
  return json.data ?? null
}

export function useUserMe() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: fetchUserMe,
    staleTime: 1000 * 60 * 5,
  })
}
