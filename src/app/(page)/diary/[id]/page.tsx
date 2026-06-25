import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Image from 'next/image';
import { authOptions } from '@/lib/auth';
import { getSessionUserId } from '@/lib/auth/session';
import { getDiaryById } from '@/domains/diary/diary.service';
import styles from './page.module.scss';
import DiaryActions from './DiaryActions';
import DiaryDetailHeader from './DiaryDetailHeader';

export default async function DiaryDetailPage({
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

  return (
    <>
      <DiaryDetailHeader />
      <div className={styles.diary}>
      <div className={styles['diary__body']} data-emotion={diary.emotionType}>
        <Image
          className={styles['diary__character']}
          src={`/images/characters/character-${diary.emotionType}.svg`}
          alt=""
          width={355}
          height={194}
        />

        <div className={styles['diary__title']}>{diary.title}</div>
        <div className={styles['diary__content']}>{diary.content}</div>
        <time className={styles['diary__createdAt']}>{diary.diaryDate}</time>
      </div>

      <div className={styles['diary__actions']}>
        <DiaryActions diaryId={id} diaryDate={diary.diaryDate} className={styles.diaryActions} />
      </div>
    </div>
    </>
  );
}
