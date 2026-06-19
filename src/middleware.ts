import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// TODO: [개발 완료 후 반드시 제거] 개발 편의를 위해 인증 bypass 설정
// 실제 배포 전 아래 DEV_BYPASS 조건 및 분기 로직을 제거하고 export { default } from 'next-auth/middleware' 로 교체할 것
const DEV_BYPASS = process.env.NODE_ENV === 'development'

export default withAuth(
  function middleware() {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        if (DEV_BYPASS) return true
        return !!token
      },
    },
  },
)

export const config = {
  matcher: [
    '/((?!login(?:/|$)|auth/callback(?:/|$)|terms(?:/|$)|privacy(?:/|$)|api/auth(?:/|$)|_next/static|_next/image|favicon\\.ico$|images(?:/|$)).*)',
  ],
}
