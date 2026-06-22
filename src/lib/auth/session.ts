import type { NextRequest } from 'next/server'
import type { Session } from 'next-auth'
import { getToken } from 'next-auth/jwt'

// NextAuth v4는 기본 Session 타입에 user.id를 포함하지 않음
// authOptions의 callbacks.session에서 token.sub를 user.id로 추가해야 함
export function getSessionUserId(session: Session | null | undefined): string | undefined {
  return (session?.user as { id?: string } | undefined)?.id
}

// getServerSession 대신 getToken을 사용해 JWT 파싱만 수행 (callback 실행 없음)
export async function getRequestUserId(req: NextRequest): Promise<string | undefined> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  return token?.sub ?? undefined
}
