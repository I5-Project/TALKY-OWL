// 갈등 카테고리 (4가지 고정값, DB CategoryGroup enum @map 값 기준)
export type CategoryGroup = 'romance' | 'family' | 'friend' | 'work'

// 필드 단위 유효성 검사 에러 (폼 에러 표시용)
export interface ApiFieldError {
  field: string
  code: string
  message: string
}

// API 에러 상세
export interface ApiError {
  // 클라이언트가 분기 처리할 수 있는 에러 코드
  // ex) 'DISPUTE_NOT_FOUND' | 'UNAUTHORIZED' | 'VALIDATION_ERROR' | 'CONFLICT'
  code: string
  // 사용자에게 보여줄 수 있는 메시지
  message: string
  // 추가 기술 컨텍스트 (디버깅용, 프로덕션에서 선택적 노출)
  details?: string
  // 유효성 검사 실패 시 필드별 에러 목록
  fieldErrors?: ApiFieldError[]
}

// API 공통 응답 구조
export interface ApiResponse<T = undefined> {
  success: boolean
  data?: T
  error?: ApiError
}
