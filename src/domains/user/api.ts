import type { ApiResponse } from '@/types/common'

export interface UserProfile {
  id: string
  email: string | null
  nickname: string | null
  profileImageUrl: string | null
  mbti: string | null
}

export interface UpdateProfileParams {
  email?: string
  nickname?: string
  mbti?: string | null
  profileImage?: File
}

export async function fetchUserMe(): Promise<UserProfile> {
  const res = await fetch('/api/user/me')
  if (!res.ok) throw new Error('사용자 정보를 불러오지 못했습니다.')
  const json: ApiResponse<UserProfile> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message ?? '알 수 없는 오류')
  return json.data
}

export async function updateUserProfile(params: UpdateProfileParams): Promise<UserProfile> {
  const formData = new FormData()

  if (params.email !== undefined) formData.append('email', params.email)
  if (params.nickname !== undefined) formData.append('nickname', params.nickname)
  if (params.mbti !== undefined) formData.append('mbti', params.mbti ?? '')
  if (params.profileImage) formData.append('profileImage', params.profileImage)

  const res = await fetch('/api/user/me', {
    method: 'PATCH',
    body: formData,
  })
  const json: ApiResponse<UserProfile> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message ?? '수정에 실패했습니다.')
  return json.data
}
