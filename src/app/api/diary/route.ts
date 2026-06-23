import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth/session';
import { createDiary } from '@/domains/diary/diary.service';
import type { ApiResponse } from '@/types/common';
import type { DiaryItem } from '@/types/diary';

// POST /api/diary
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    );
  }

  let body: { title?: string; content?: string; emotionType?: string; diaryDate?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INVALID_JSON', message: '요청 본문이 올바른 JSON 형식이 아닙니다.' } },
      { status: 400 },
    );
  }

  const { title, content, emotionType, diaryDate } = body;

  if (!content || !diaryDate) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'VALIDATION_ERROR', message: '내용과 날짜는 필수입니다.' } },
      { status: 400 },
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(diaryDate)) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'diaryDate 형식이 올바르지 않습니다. (YYYY-MM-DD)' } },
      { status: 400 },
    );
  }

  //실제 존재하는 날짜검증
  const parsedDate = new Date(`${diaryDate}T00:00:00.000Z`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== diaryDate) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'VALIDATION_ERROR', message: '유효한 diaryDate가 아닙니다. (YYYY-MM-DD)' } },
      { status: 400 },
    );
  }

  try {
    const parsedDateObj = new Date(`${diaryDate}T00:00:00.000Z`);
    const nextDay = new Date(parsedDateObj);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const existingCount = await prisma.emotionDiary.count({
      where: {
        userId,
        emotionType: emotionType ?? 'neutral',
        diaryDate: { gte: parsedDateObj, lt: nextDay },
        deletedAt: null,
      },
    });

    if (existingCount >= 2) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'DIARY_LIMIT_EXCEEDED', message: '하루에 같은 카테고리 3개 이상은 등록할 수 없습니다.' } },
        { status: 422 },
      );
    }

    const diaryId = await createDiary(userId, { title: title ?? '', content, emotionType: emotionType ?? 'neutral', diaryDate });
    if (!diaryId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
        { status: 500 },
      );
    }

    return NextResponse.json<ApiResponse<{ id: string }>>({ success: true, data: { id: diaryId } }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    );
  }
}

// GET /api/diary?date=2026-06-16
// 특정 날짜의 감정일기 목록 조회. 최신순 정렬. 본인 데이터만 반환
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'date 파라미터가 필요합니다. (YYYY-MM-DD)' },
      },
      { status: 400 },
    );
  }
  const targetDate = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(targetDate.getTime()) || targetDate.toISOString().slice(0, 10) !== date) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '유효한 date가 아닙니다. (YYYY-MM-DD)' },
      },
      { status: 400 },
    );
  }
  const nextDate = new Date(targetDate);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);

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
    });

    const items: DiaryItem[] = diaries.map((d) => ({
      id: d.id,
      title: d.title ?? '',
      content: d.content,
      date: d.diaryDate.toISOString().slice(0, 10),
      emotionType: (d.emotionType ?? 'neutral') as DiaryItem['emotionType'],
    }));

    return NextResponse.json<ApiResponse<{ items: DiaryItem[] }>>({
      success: true,
      data: { items },
    });
  } catch (error) {
    console.error('[GET /api/diary]', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 },
    );
  }
}
