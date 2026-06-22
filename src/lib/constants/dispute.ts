export const VALID_CATEGORY_GROUPS = ['romance', 'family', 'friend', 'work'] as const

// BOTH_SUBMITTED 이후 상태는 사건 수정 불가 (Prisma enum key 기준)
export const IMMUTABLE_DISPUTE_STATUSES = [
  'BOTH_SUBMITTED',
  'JUDGING',
  'JUDGED',
  'CLOSED',
  'EXPIRED',
  'DELETED',
] as const

// 진행중 상태 = 판결/종료/삭제되지 않은 상태 (카테고리 한도 체크 기준)
export const COMPLETED_DISPUTE_STATUSES = ['JUDGED', 'CLOSED', 'EXPIRED', 'DELETED'] as const

export const CATEGORY_ACTIVE_LIMIT = 2
