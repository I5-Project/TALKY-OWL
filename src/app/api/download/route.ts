import { NextRequest, NextResponse } from 'next/server'
import type { ApiResponse } from '@/types/common'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'BAD_REQUEST', message: 'url 파라미터가 필요합니다.' } },
      { status: 400 },
    )
  }

  const supabaseUrl = process.env.SUPABASE_URL
  if (!supabaseUrl) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'CONFIG_ERROR', message: '서버 설정 오류입니다.' } },
      { status: 500 },
    )
  }

  const allowedHostname = new URL(supabaseUrl).hostname
  const requestedHostname = new URL(url).hostname

  if (requestedHostname !== allowedHostname) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'FORBIDDEN', message: '허용되지 않은 URL입니다.' } },
      { status: 403 },
    )
  }

  const res = await fetch(url)
  if (!res.ok) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'FETCH_ERROR', message: '이미지를 가져오지 못했습니다.' } },
      { status: 502 },
    )
  }

  const blob = await res.blob()
  return new NextResponse(blob, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Disposition': 'attachment; filename="talkyowl-conflict-type.jpg"',
    },
  })
}
