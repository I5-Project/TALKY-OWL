export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/((?!login(?:/|$)|terms(?:/|$)|privacy(?:/|$)|api/auth(?:/|$)|_next/static|_next/image|favicon\\.ico$|images(?:/|$)).*)',
  ],
}
