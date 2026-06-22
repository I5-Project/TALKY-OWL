'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchCalendarRecords } from './calendar.api'

export const calendarKeys = {
  month: (year: number, month: number) => ['calendar', year, month] as const,
}

export function useCalendarRecords(year: number, month: number) {
  return useQuery({
    queryKey: calendarKeys.month(year, month),
    queryFn: () => fetchCalendarRecords(year, month),
    enabled: !!year && !!month,
    staleTime: 1000 * 60 * 5,
  })
}
