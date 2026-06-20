import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSessionUserId } from '@/lib/auth/session'
import type { ApiResponse } from '@/types/common'
import type { DiaryItem } from '@/types/diary'

// GET /api/diary?date=2026-06-16
// 특정 날짜의 감정일기 목록 조회. 최신순 정렬. 본인 데이터만 반환
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    )
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'date 파라미터가 필요합니다. (YYYY-MM-DD)' } },
      { status: 400 },
    )
  }

  const targetDate = new Date(date)
  const nextDate = new Date(targetDate)
  nextDate.setDate(nextDate.getDate() + 1)

  try {
    const diaries = await prisma.emotionDiary.findMany({
      where: {
        userId,
        diaryDate: { gte: targetDate, lt: nextDate },
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        content: true,
        diaryDate: true,
        emotionType: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const items: DiaryItem[] = diaries.map((d) => ({
      id: d.id,
      title: d.title ?? '',
      content: d.content,
      date: d.diaryDate.toISOString().slice(0, 10),
      emotionType: (d.emotionType ?? 'neutral') as DiaryItem['emotionType'],
    }))

    return NextResponse.json<ApiResponse<{ items: DiaryItem[] }>>({
      success: true,
      data: { items },
    })
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}