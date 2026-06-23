import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: request.nextUrl.protocol === 'https:',
  })

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!login(?:/|$)|auth/callback(?:/|$)|terms(?:/|$)|privacy(?:/|$)|about(?:/|$)|contact(?:/|$)|join(?:/|$)|api/auth(?:/|$)|_next/static|_next/image|favicon\\.ico$|images(?:/|$)|$).*)',
  ],
}
