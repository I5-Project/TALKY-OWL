import { NextRequest, NextResponse } from 'next/server'
import type { ApiResponse } from '@/types/common'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'BAD_REQUEST', message: 'url 파라미터가 필요합니다.' } },
        { status: 400 },
      )
    }

    const requestedHostname = new URL(url).hostname
    if (!requestedHostname.endsWith('.supabase.co')) {
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

    const contentType = res.headers.get('content-type')?.toLowerCase() ?? ''
    if (!contentType.startsWith('image/')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: '이미지 파일만 다운로드할 수 있습니다.' } },
        { status: 415 },
      )
    }

    const blob = await res.blob()
    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'attachment; filename="talkyowl-conflict-type.jpg"',
      },
    })
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '다운로드 처리 중 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
