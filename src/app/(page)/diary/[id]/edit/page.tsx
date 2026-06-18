'use client';

import { useRouter } from 'next/navigation';
import styles from './DiaryDetail.module.scss';

export default function DiaryDetail({
  diary,
}: {
  diary: {
    id: number;
    title: string;
    content: string;
    emotion: string;
    createdAt: string;
  };
}) {
  const router = useRouter();

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <span>{diary.emotion}</span>
        <span>{diary.createdAt}</span>
      </div>

      <h1 className={styles.title}>
        {diary.title}
      </h1>

      <article className={styles.content}>
        {diary.content}
      </article>

      <button
        className={styles.editButton}
        onClick={() =>
          router.push(`/diary/${diary.id}/edit`)
        }
      >
        수정하기
      </button>
    </section>
  );
}