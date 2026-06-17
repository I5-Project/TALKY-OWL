import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTopTypes } from '@/domains/statistics/statisticsService'
import type { ApiResponse } from '@/types/common'

// GET /api/v1/statistics/top-types
// 판결 완료 사건 기준 결과 유형 Top5 + 비율 반환
export async function GET() {
  // 서버에서 세션을 직접 검증
  // FE에서 로그인 페이지로 리다이렉트하더라도, API는 직접 호출될 수 있으므로
  // 서버에서 반드시 인증을 검증한다 (CLAUDE.md §7: 권한 검증은 서버에서 최종 수행)
  const session = await getServerSession(authOptions)

  // session이 없다 = 로그인하지 않은 요청
  // 브라우저가 아닌 curl, Postman 등으로 직접 API를 호출하는 경우도 막기 위함
  // HTTP 401: 인증되지 않은 요청
  if (!session) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    )
  }

  try {
    // 판결 완료(JUDGED) 기준 Top5 유형 + 각 유형의 비율 조회
    const result = await getTopTypes(5)

    // result = { items: [...], page: {...} } 를 data 아래로 중첩
    return NextResponse.json<ApiResponse<typeof result>>({ success: true, data: result })
  } catch {
    // DB 오류 등 예상치 못한 서버 에러
    // HTTP 500: 서버 내부 오류
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
