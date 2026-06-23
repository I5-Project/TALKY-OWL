import { prisma } from '@/lib/db';
import type { EmotionType } from '@/types/diary';

export async function createDiary(
  userId: string,
  data: { title: string; content: string; emotionType: string; diaryDate: string },
): Promise<string | null> {
  try {
    const diary = await prisma.emotionDiary.create({
      data: {
        userId,
        title: data.title,
        content: data.content,
        emotionType: data.emotionType,
        diaryDate: new Date(`${data.diaryDate}T00:00:00.000Z`),
      },
    });
    return diary.id;
  } catch (error) {
    console.error('[createDiary]', error);
    return null;
  }
}

export type DiaryMutationResult = 'ok' | 'not_found' | 'forbidden'

export async function updateDiaryById(
  diaryId: string,
  userId: string,
  data: { title: string; content: string; emotionType: string },
): Promise<DiaryMutationResult> {
  const diary = await prisma.emotionDiary.findUnique({
    where: { id: diaryId },
    select: { userId: true, deletedAt: true },
  });

  if (!diary || diary.deletedAt !== null) return 'not_found';
  if (diary.userId !== userId) return 'forbidden';

  await prisma.emotionDiary.updateMany({
    where: { id: diaryId, userId, deletedAt: null },
    data,
  });

  return 'ok';
}

export async function deleteDiaryById(diaryId: string, userId: string): Promise<DiaryMutationResult> {
  const diary = await prisma.emotionDiary.findUnique({
    where: { id: diaryId },
    select: { userId: true, deletedAt: true },
  });

  if (!diary || diary.deletedAt !== null) return 'not_found';
  if (diary.userId !== userId) return 'forbidden';

  await prisma.emotionDiary.updateMany({
    where: { id: diaryId, userId, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  return 'ok';
}

export async function getDiaryById(diaryId: string, userId: string) {
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

    if (!diary || diary.userId !== userId) return null;

    return {
      id: diary.id,
      title: diary.title ?? '',
      content: diary.content,
      diaryDate: diary.diaryDate.toISOString().slice(0, 10),
      emotionType: (diary.emotionType as EmotionType | null) ?? null,
      createdAt: diary.createdAt.toISOString(),
      updatedAt: diary.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('[getDiaryById]', error);
    return null;
  }
}
