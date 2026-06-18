import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { ApiResponse } from '@/types/common'

interface ExpireResult {
  expiredCount: number
}

// POST /api/cron/expire-invitations
// invite_ready 상태이고 expires_at이 지난 방을 expired로 일괄 처리
// Authorization: Bearer {CRON_SECRET} 헤더 필요
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' } },
      { status: 401 },
    )
  }

  try {
    const result = await prisma.disputeRoom.updateMany({
      where: {
        roomMode: 'INVITE_READY',
        expiresAt: { lt: new Date() },
        deletedAt: null,
      },
      data: { roomMode: 'EXPIRED' },
    })

    return NextResponse.json<ApiResponse<ExpireResult>>({
      success: true,
      data: { expiredCount: result.count },
    })
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
