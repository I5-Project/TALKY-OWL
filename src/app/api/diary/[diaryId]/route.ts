import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth/session';
import { deleteDiaryById, updateDiaryById } from '@/domains/diary/diary.service';
import type { ApiResponse } from '@/types/common';
import type { DiaryDetail, EmotionType } from '@/types/diary';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ diaryId: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    );
  }

  const { diaryId } = await params;

  try {
    const diary = await prisma.emotionDiary.findUnique({
      where: { id: diaryId, deletedAt: null },
      select: {
        id: true,
        title: true,
        content: true,
        diaryDate: true,
        emotionType: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    if (!diary) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NOT_FOUND', message: '일기를 찾을 수 없습니다.' } },
        { status: 404 },
      );
    }

    if (diary.userId !== userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다.' } },
        { status: 403 },
      );
    }

    return NextResponse.json<ApiResponse<DiaryDetail>>({
      success: true,
      data: {
        id: diary.id,
        title: diary.title ?? '',
        diaryDate: diary.diaryDate.toISOString().slice(0, 10),
        emotionType: (diary.emotionType as EmotionType | null) ?? null,
        content: diary.content,
        createdAt: diary.createdAt.toISOString(),
        updatedAt: diary.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ diaryId: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    );
  }

  const { diaryId } = await params;

  let body: { title?: string; content?: string; emotionType?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INVALID_JSON', message: '요청 본문이 올바른 JSON 형식이 아닙니다.' } },
      { status: 400 },
    );
  }

  const { title, content, emotionType } = body;

  if (!content) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'VALIDATION_ERROR', message: '내용은 필수입니다.' } },
      { status: 400 },
    );
  }

  try {
    const result = await updateDiaryById(diaryId, userId, { title: title ?? '', content, emotionType: emotionType ?? 'neutral' });

    if (result === 'not_found') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NOT_FOUND', message: '일기를 찾을 수 없습니다.' } },
        { status: 404 },
      );
    }
    if (result === 'forbidden') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다.' } },
        { status: 403 },
      );
    }

    return NextResponse.json<ApiResponse>({ success: true });
  } catch (error) {
    console.error('[PATCH /api/diary/:diaryId]', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ diaryId: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    );
  }

  const { diaryId } = await params;

  try {
    const result = await deleteDiaryById(diaryId, userId);

    if (result === 'not_found') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NOT_FOUND', message: '일기를 찾을 수 없습니다.' } },
        { status: 404 },
      );
    }
    if (result === 'forbidden') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다.' } },
        { status: 403 },
      );
    }

    return NextResponse.json<ApiResponse>({ success: true });
  } catch (error) {
    console.error('[DELETE /api/diary/:diaryId]', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    );
  }
}
