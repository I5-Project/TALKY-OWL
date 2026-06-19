import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSessionUserId } from '@/lib/auth/session'
import type { ApiResponse } from '@/types/common'

interface UserMeDto {
  id: string
  nickname: string | null
  mbti: string | null
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)

  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nickname: true, mbti: true },
    })

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'USER_NOT_FOUND', message: '사용자를 찾을 수 없습니다.' } },
        { status: 404 },
      )
    }

    return NextResponse.json<ApiResponse<UserMeDto>>({
      success: true,
      data: { id: user.id, nickname: user.nickname, mbti: user.mbti },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[users/me] api error', { message })
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
