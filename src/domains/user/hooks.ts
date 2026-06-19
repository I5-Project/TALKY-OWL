'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ApiResponse } from '@/types/common'

interface UserMeData {
  id: string
  name: string | null
  nickname: string | null
  mbti: string | null
}

export interface UpdateProfileParams {
  name?: string
  nickname?: string
  mbti?: string | null
}

const USER_ME_KEY = ['user', 'me'] as const

async function fetchUserMe(): Promise<UserMeData | null> {
  const res = await fetch('/api/users/me')
  if (res.status === 401) return null
  if (!res.ok) throw new Error('사용자 정보를 불러오지 못했습니다.')
  const json: ApiResponse<UserMeData> = await res.json()
  return json.data ?? null
}

async function updateUserProfile(params: UpdateProfileParams): Promise<UserMeData> {
  const res = await fetch('/api/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const json: ApiResponse<UserMeData> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message ?? '수정에 실패했습니다.')
  return json.data
}

export function useUserMe() {
  return useQuery({
    queryKey: USER_ME_KEY,
    queryFn: fetchUserMe,
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: UpdateProfileParams) => updateUserProfile(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_ME_KEY })
    },
  })
}
