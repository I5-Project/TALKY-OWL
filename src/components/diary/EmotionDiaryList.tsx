'use client';

import DiaryCard from '@/components/diary/DiaryCard';
import { useDiariesByDate } from '@/domains/diary/diary.hooks';
import styles from '@/components/diary/EmotionDiaryList.module.scss';

type Props = {
  selectedDate: string;
};

export default function EmotionDiaryList({ selectedDate }: Props) {
  const { data: items = [], isLoading, isError } = useDiariesByDate(selectedDate);

  if (isLoading) return <div className={styles.empty}>불러오는 중...</div>;
  if (isError) return <div className={styles.empty}>일기를 불러오지 못했어요</div>;

  if (items.length === 0) {
    return <div className={styles.empty}>등록한 일기가 없어요</div>;
  }

  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.id}>
          <DiaryCard {...item} />
        </li>
      ))}
    </ul>
  );
}
