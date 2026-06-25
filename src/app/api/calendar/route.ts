import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth/session';
import type { ApiResponse } from '@/types/common';
import type { CalendarMonthResponse, CalendarRecordItem } from '@/types/calendar';

// GET /api/calendar?year=2026&month=6
// 해당 월의 날짜별 감정일기/사건 요약 반환 (달력 마킹용)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getSessionUserId(session);
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') ?? '', 10);
    const month = parseInt(searchParams.get('month') ?? '', 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'year, month가 올바르지 않습니다.' },
        },
        { status: 400 },
      );
    }

    // 해당 월의 시작일(1일 00:00)과 종료일(다음달 1일 00:00) 계산
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    // 두 쿼리를 병렬로 실행해 응답 시간 단축
    const [diaries, disputes] = await Promise.all([
      // 감정일기: 해당 월 전체 조회 (diaryDate + emotionType만 선택)
      // 최신순 정렬 → 날짜별 첫 번째 항목이 그 날의 최신 감정
      prisma.emotionDiary.findMany({
        where: {
          userId,
          diaryDate: { gte: startDate, lt: endDate },
          deletedAt: null,
        },
        select: { diaryDate: true, emotionType: true },
        orderBy: { createdAt: 'desc' },
      }),

      // 사건: 종료된(JUDGED) 사건만 조회 (createdAt + categoryGroup만 선택)
      // participants.some으로 내가 참여한 사건만 필터링
      prisma.dispute.findMany({
        where: {
          deletedAt: null,
          status: 'JUDGED',
          createdAt: { gte: startDate, lt: endDate },
          participants: { some: { userId } },
        },
        select: { createdAt: true, categoryGroup: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // 감정일기 날짜별 그루핑
    // Map key: "YYYY-MM-DD", value: { count, emotion }
    // 이미 최신순 정렬이므로 날짜 첫 등장 시 저장한 emotion이 그 날의 최신 emotion
    const diaryMap = new Map<string, { count: number; emotion: string }>();
    for (const d of diaries) {
      const date = d.diaryDate.toISOString().slice(0, 10);
      if (!diaryMap.has(date)) {
        diaryMap.set(date, { count: 0, emotion: d.emotionType ?? 'neutral' });
      }
      diaryMap.get(date)!.count++;
    }

    // 사건 날짜별 그루핑
    // createdAt 기준으로 날짜 추출 → 동일 방식으로 최신 category 저장
    const disputeMap = new Map<string, { count: number; category: string }>();
    for (const d of disputes) {
      const date = d.createdAt.toISOString().slice(0, 10);
      if (!disputeMap.has(date)) {
        disputeMap.set(date, { count: 0, category: d.categoryGroup.toLowerCase() });
      }
      disputeMap.get(date)!.count++;
    }

    // 두 Map의 날짜를 합쳐서 중복 없이 전체 날짜 목록 생성
    const allDates = new Set([...diaryMap.keys(), ...disputeMap.keys()]);

    // 각 날짜별로 diary/dispute 요약 조합
    // 둘 중 하나만 있는 날짜는 없는 쪽을 null로 처리
    const records: CalendarRecordItem[] = Array.from(allDates).map((date) => ({
      date,
      diary: diaryMap.get(date) ?? null,
      dispute: disputeMap.get(date) ?? null,
    }));

    return NextResponse.json<ApiResponse<CalendarMonthResponse>>({
      success: true,
      data: { year, month, records },
    });
  } catch (error) {
    console.error('[GET /api/calendar] failed', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 },
    );
  }
}
