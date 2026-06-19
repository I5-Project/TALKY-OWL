import { createHmac, randomUUID } from 'crypto'

const INVITE_EXPIRES_HOURS = 72

export function generateInviteToken(): string {
  return randomUUID()
}

export function hashInviteToken(token: string): string {
  const secret = process.env.ROOM_TOKEN_SECRET
  if (!secret) throw new Error('ROOM_TOKEN_SECRET가 설정되지 않았습니다.')
  return createHmac('sha256', secret).update(token).digest('hex')
}

export function getInviteExpiresAt(): Date {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + INVITE_EXPIRES_HOURS)
  return expiresAt
}

