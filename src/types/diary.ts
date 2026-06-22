/** 감정일기 아이콘 감정 값 (한글) */
export type Feel = '기쁨' | '슬픔' | '보통' | '짜증' | '화남'

/** EmotionIcon 컴포넌트 이모션 타입 (영문) */
export type EmotionType = 'happy' | 'sad' | 'angry' | 'annoyed' | 'neutral'



/** 캘린더 날짜별 감정일기 요약 */
export interface DiaryDaySummary {
  feel: string
  count: number
}

/** 캘린더 탭 구분 */
export type DiaryTab = 'emotion' | 'record'


/** CalendarView 컴포넌트 Props */
export interface CalendarViewProps {
  onDateChange: (date: string) => void
  selectedDate?: string
  calendarData?: import('@/types/calendar').CalendarRecordItem[]
}

/** EmotionIcon 컴포넌트 Props */
export interface EmotionIconProps {
  feel: string
  size?: number
  count?: number
}

/** DiaryCard 컴포넌트 Props */
export interface DiaryCardProps {
  id: string
  title: string
  content: string
  date: string
  emotionType: EmotionType
  onClick?: () => void
}


/** 감정일기 목록 아이템 */
export interface DiaryItem {
  id: string
  title: string
  content: string
  date: string
  emotionType: EmotionType
}

/** 감정일기 상세 */
export interface DiaryDetail {
  id: string
  title: string
  content: string
  diaryDate: string
  emotionType: string | null
  createdAt: string
  updatedAt: string
}
