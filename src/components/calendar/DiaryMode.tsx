'use client';

import { useState } from 'react';
import EmotionDiaryList from './EmotionDiaryList';
import RecordList from './RecordList';
import styles from './DiaryMode.module.scss';

type DiaryTab = 'emotion' | 'record';

const tabMode: { key: DiaryTab; label: string }[] = [
  { key: 'emotion', label: '감정일기' },
  { key: 'record', label: '사건기록' },
];

type Props = {
  selectedDate: string;
};

export default function DiaryMode({ selectedDate }: Props) {
  const [diaryTabMode, setDiaryTab] = useState<DiaryTab>('emotion');

  return (
    <div className={styles.diaryMode}>
      <div className={styles.tab}>
        {tabMode.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab__button} ${diaryTabMode === tab.key ? styles['tab__button--active'] : ''}`}
            onClick={() => setDiaryTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {diaryTabMode === 'emotion' && <EmotionDiaryList selectedDate={selectedDate} />}
        {diaryTabMode === 'record' && <RecordList selectedDate={selectedDate} />}
      </div>
    </div>
  );
}
