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
