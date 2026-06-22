export interface CalendarDiarySummary {
  count: number
  emotion: string
}

export interface CalendarDisputeSummary {
  count: number
  category: string
}

export interface CalendarRecordItem {
  date: string
  diary: CalendarDiarySummary | null
  dispute: CalendarDisputeSummary | null
}

export interface CalendarMonthResponse {
  year: number
  month: number
  records: CalendarRecordItem[]
}
