// DB ResponsibleRole enum @map 값 기준
export type ResponsibleRole = 'role_a' | 'role_b' | 'equal'

// DB CardImageStatus enum @map 값 기준
export type CardImageStatus = 'pending' | 'generated' | 'failed'

// ============================================================
// Response DTOs
// ============================================================

// 갈등 결과 유형 - 세부 유형 (16가지 중 AI가 도출, DB 마스터 데이터 기반)
export interface ConflictTypeDetailDto {
  id: string
  detailCode: string
  displayName: string
  description: string | null
  cardImageUrl: string | null
}

export interface JudgmentResultCardDto {
  id: string
  characterType: string | null
  cardTitle: string
  cardSummary: string
  shareMessage: string | null
  imageAssetId: string | null
  imageStatus: CardImageStatus
  shareEnabled: boolean
  generatedAt: string | null
  createdAt: string
}

// AI 판결 고지 문구 (버전 관리 - 사용자에게 표시)
export interface AiResultNoticeDto {
  id: string
  noticeType: string
  title: string
  content: string
  version: string
}

export interface AiJudgmentDto {
  id: string
  disputeId: string
  // A/B 판결 점수
  verdictScoreA: number
  verdictScoreB: number
  moreResponsibleRole: ResponsibleRole | null
  // 핵심 쟁점 요약
  issueSummary: string
  // 판결 근거 (역할별)
  aFault: string | null
  bFault: string | null
  // 화해 제안 (역할별)
  aSuggestedLine: string | null
  bSuggestedLine: string | null
  // 세부 결과 유형 (DB 마스터 기반)
  resultConflictDetail: ConflictTypeDetailDto
  // 결과 카드
  resultCard: JudgmentResultCardDto | null
  resultCardSummary: string | null
  // 화해/선물 메시지
  shareMessage: string | null
  // MBTI 기반 한 줄 코멘트
  mbtiNote: string | null
  // AI 판결 고지 문구
  aiNotice: AiResultNoticeDto | null
  modelName: string
  createdAt: string
  updatedAt: string
}

// ============================================================
// Request Types
// ============================================================

// AI 판결은 양측 진술 완료(both_submitted) 후 트리거
export interface CreateAiJudgmentRequest {
  disputeId: string
}
