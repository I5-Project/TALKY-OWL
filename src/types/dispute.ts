import type { CategoryGroup } from './common'

// DB DisputeStatus enum @map 값 기준
export type DisputeStatus =
  | 'draft'
  | 'waiting_opponent'
  | 'opponent_joined'
  | 'both_submitted'
  | 'judging'
  | 'judged'
  | 'closed'
  | 'expired'
  | 'deleted'

// DB ParticipantRole enum @map 값 기준
export type ParticipantRole = 'role_a' | 'role_b'

// ============================================================
// Response DTOs
// ============================================================

export interface DisputeParticipantDto {
  id: string
  disputeId: string
  userId: string
  role: ParticipantRole
  name: string | null
  profileImageUrl: string | null
  joinedAt: string
  createdAt: string
}

export interface DisputeStatementDto {
  id: string
  disputeId: string
  participantId: string
  userId: string
  role: ParticipantRole
  content: string
  moderationStatus: string
  submittedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface SaveStatementResponse {
  id: string
  disputeId: string
  role: string
  content: string
  submittedAt: string | null
  hasPersonalInfo: boolean
}

export interface DisputeDto {
  id: string
  roomId: string
  sourceConversationId: string | null
  categoryGroup: CategoryGroup
  title: string
  description: string | null
  status: DisputeStatus
  createdAt: string
  updatedAt: string
  participants: DisputeParticipantDto[]
  statements?: DisputeStatementDto[]
}

// ============================================================
// Request Types
// ============================================================

export interface CreateDisputeRequest {
  roomId: string
  categoryGroup: CategoryGroup
  title: string
  description?: string
  sourceConversationId?: string
}

// 수정 가능한 필드만 optional로 정의
export interface UpdateDisputeRequest {
  title?: string
  description?: string
  categoryGroup?: CategoryGroup
}

// ============================================================
// Query Params
// ============================================================

// 전체 조회 시 categoryGroup 생략, 필터 시 값 지정
export interface GetDisputeListQuery {
  categoryGroup?: CategoryGroup
}

export interface DisputeListResponse {
  disputes: DisputeDto[]
  total: number
  page: number
  limit: number
}

// ============================================================
// Statement Submit
// ============================================================

export interface StatementSubmitResponse {
  id: string
  submittedAt: string
  disputeStatus: DisputeStatus
}
