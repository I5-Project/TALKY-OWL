import type { GiftItemDto } from '@/types/gift'
import type { ApiResponse } from '@/types/common'

export async function fetchGiftItem(
  disputeId: string,
  params: { gender: string; age: string; mbti: string },
): Promise<GiftItemDto> {
  const qs = new URLSearchParams({ gender: params.gender, age: params.age, mbti: params.mbti })
  const res = await fetch(`/api/disputes/${disputeId}/gift?${qs.toString()}`)
  const json = (await res.json()) as ApiResponse<GiftItemDto>
  if (!json.success || !json.data) {
    throw new Error(json.error?.message ?? '선물 추천을 불러오지 못했습니다.')
  }
  return json.data
}
