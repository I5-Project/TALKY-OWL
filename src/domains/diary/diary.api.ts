import type { ApiResponse } from '@/types/common'
import type { DiaryItem } from '@/types/diary'

export async function fetchDiariesByDate(date: string): Promise<DiaryItem[]> {
  const res = await fetch(`/api/diary?date=${date}`)
  const json: ApiResponse<{ items: DiaryItem[] }> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message ?? '감정일기 조회 실패')
  return json.data.items
}

export async function createDiary(body: {
  title: string
  content: string
  emotionType: string
  diaryDate: string
}): Promise<{ id: string }> {
  const res = await fetch('/api/diary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json: ApiResponse<{ id: string }> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message ?? '일기 작성 실패')
  return json.data
}

export async function updateDiary(
  id: string,
  body: { title: string; content: string; emotionType: string },
): Promise<void> {
  const res = await fetch(`/api/diary/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json: ApiResponse = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? '일기 수정 실패')
}

export async function deleteDiary(id: string): Promise<void> {
  const res = await fetch(`/api/diary/${id}`, { method: 'DELETE' })
  const json: ApiResponse = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? '일기 삭제 실패')
}
