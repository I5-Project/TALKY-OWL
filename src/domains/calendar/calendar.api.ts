import type { ApiResponse } from '@/types/common'
import type { CalendarMonthResponse } from '@/types/calendar'

export async function fetchCalendarRecords(year: number, month: number): Promise<CalendarMonthResponse> {
  const res = await fetch(`/api/calendar?year=${year}&month=${month}`)
  const json: ApiResponse<CalendarMonthResponse> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message ?? '캘린더 기록 조회 실패')
  return json.data
}
