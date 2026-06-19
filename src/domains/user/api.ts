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
}

export async function fetchUserMe(): Promise<UserProfile> {
  const res = await fetch('/api/user/me')
  if (!res.ok) throw new Error('사용자 정보를 불러오지 못했습니다.')
  const json: ApiResponse<UserProfile> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message ?? '알 수 없는 오류')
  return json.data
}

export async function updateUserProfile(params: UpdateProfileParams): Promise<UserProfile> {
  const res = await fetch('/api/user/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const json: ApiResponse<UserProfile> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message ?? '알 수 없는 오류')
  return json.data
}

export async function uploadProfileImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/user/me/profile-image', {
    method: 'POST',
    body: formData,
  })
  const json: ApiResponse<{ profileImageUrl: string }> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message ?? '알 수 없는 오류')
  return json.data.profileImageUrl
}
