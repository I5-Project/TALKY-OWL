import { cache } from 'react'
import { decode } from 'next-auth/jwt'
import { cookies } from 'next/headers'
import type { Session } from 'next-auth'

export const getCachedSession = cache(async (): Promise<Session | null> => {
  const cookieStore = await cookies()
  const token =
    cookieStore.get('next-auth.session-token')?.value ??
    cookieStore.get('__Secure-next-auth.session-token')?.value

  if (!token) return null

  const decoded = await decode({ token, secret: process.env.NEXTAUTH_SECRET! })
  if (!decoded) return null

  return {
    user: {
      id: decoded.sub,
      name: decoded.name as string | null | undefined,
      email: decoded.email as string | null | undefined,
      image: decoded.picture as string | null | undefined,
    },
    expires: new Date(((decoded.exp as number | undefined) ?? 0) * 1000).toISOString(),
  } as Session
})
