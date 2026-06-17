import type { CategoryGroup } from './common'

// DB RoomMode enum @map 값 기준
export type RoomMode =
  | 'ai_chat'
  | 'invite_ready'
  | 'one_to_one'
  | 'closed'
  | 'expired'
  | 'deleted'

// ============================================================
// Response DTOs
// ============================================================

export interface RoomDto {
  id: string
  roomNo: string
  creatorUserId: string
  categoryGroup: CategoryGroup
  roomMode: RoomMode
  inviteCreatedAt: string | null
  expiresAt: string | null
  closedAt: string | null
  createdAt: string
  updatedAt: string
}

// ============================================================
// Request Types
// ============================================================

export interface CreateRoomRequest {
  categoryGroup: CategoryGroup
}

// ============================================================
// Query / Response
// ============================================================

export interface RoomListResponse {
  rooms: RoomDto[]
  total: number
  page: number
  limit: number
}
