import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth/session';
import { deleteDiaryById, updateDiaryById } from '@/domains/diary/diary.service';
import type { ApiResponse } from '@/types/common';
import type { DiaryDetail } from '@/types/diary';

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
        emotionType: diary.emotionType ?? null,
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
  const body = await request.json();
  const { title, content, emotionType } = body;

  if (!content) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'VALIDATION_ERROR', message: '내용은 필수입니다.' } },
      { status: 400 },
    );
  }

  const updated = await updateDiaryById(diaryId, userId, { title: title ?? '', content, emotionType: emotionType ?? 'neutral' });
  if (!updated) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'NOT_FOUND', message: '일기를 찾을 수 없습니다.' } },
      { status: 404 },
    );
  }

  return NextResponse.json<ApiResponse>({ success: true });
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

  const deleted = await deleteDiaryById(diaryId, userId);
  if (!deleted) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'NOT_FOUND', message: '일기를 찾을 수 없습니다.' } },
      { status: 404 },
    );
  }

  return NextResponse.json<ApiResponse>({ success: true });
}
