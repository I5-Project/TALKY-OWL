export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/((?!login(?:/|$)|auth/callback(?:/|$)|terms(?:/|$)|privacy(?:/|$)|about(?:/|$)|contact(?:/|$)|join(?:/|$)|api/auth(?:/|$)|_next/static|_next/image|favicon\\.ico$|images(?:/|$)|$).*)',
  ],
}
