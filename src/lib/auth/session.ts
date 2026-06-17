import type { Session } from 'next-auth'

// NextAuth v4는 기본 Session 타입에 user.id를 포함하지 않음
// authOptions의 callbacks.session에서 token.sub를 user.id로 추가해야 함
export function getSessionUserId(session: Session | null | undefined): string | undefined {
  return (session?.user as { id?: string } | undefined)?.id
}
