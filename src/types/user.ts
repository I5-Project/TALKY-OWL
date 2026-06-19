export interface UserMeDto {
  id: string
  name: string | null
  nickname: string | null
  mbti: string | null
}

export interface PatchUserBody {
  name?: string
  nickname?: string
  mbti?: string | null
}

export const VALID_MBTI = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
] as const
