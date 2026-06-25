import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSessionUserId } from '@/lib/auth/session';
import { getDiaryById } from '@/domains/diary/diary.service';
import DiaryCreate from '@/app/(page)/diary/create/page';

export default async function DiaryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) redirect('/login');

  const { id } = await params;
  const diary = await getDiaryById(id, userId);
  if (!diary) notFound();

  return <DiaryCreate mode="edit" diary={diary} />;
}
