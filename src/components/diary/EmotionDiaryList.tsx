'use client';

import DiaryCard from '@/components/diary/DiaryCard';
import type { EmotionType } from '@/components/diary/DiaryCard';
import styles from './EmotionDiaryList.module.scss';

interface DiaryItem {
  id: string;
  title: string;
  content: string;
  date: string;
  emotionType: EmotionType;
}

const DUMMY_ITEMS: DiaryItem[] = [
  {
    id: '1',
    title: '비가온다',
    content: '우르르쾅쾅 마음이 무겁다',
    date: '26-06-14',
    emotionType: 'sad',
  },
  {
    id: '2',
    title: '오늘은 기분이 좋아',
    content: '오랜만에 친구를 만났다. 별거 아닌 얘기를 나눴는데 기분이 한결 가벼워졌다.',
    date: '26-06-15',
    emotionType: 'happy',
  },
];

type Props = {
  selectedDate: string;
};

export default function EmotionDiaryList({ selectedDate }: Props) {
  if (DUMMY_ITEMS.length === 0) {
    return <div>등록한 일기가 없어요 {selectedDate}</div>;
  }

  return (
    <ul
      className={styles.list}
      style={{
        listStyle: 'none',
        marginBlock: '10px',

        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {DUMMY_ITEMS.map((item) => (
        <li key={item.id}>
          <DiaryCard {...item} />
        </li>
      ))}
    </ul>
  );
}
