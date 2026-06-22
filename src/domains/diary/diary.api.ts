import type { ApiResponse } from '@/types/common'
import type { DiaryItem } from '@/types/diary'

export async function fetchDiariesByDate(date: string): Promise<DiaryItem[]> {
  const res = await fetch(`/api/diary?date=${date}`)
  const json: ApiResponse<{ items: DiaryItem[] }> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message ?? '감정일기 조회 실패')
  return json.data.items
}
