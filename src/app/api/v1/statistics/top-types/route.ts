import { NextResponse } from 'next/server'
import { getTopTypes } from '@/domains/statistics/statisticsService'
import type { ApiResponse } from '@/types/common'

// GET /api/v1/statistics/top-types
// 판결 완료 사건 기준 결과 유형 Top5 + 비율 반환
// 메인 페이지에서도 노출되는 익명 집계 데이터이므로 인증 없이 접근 가능
export async function GET() {
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
