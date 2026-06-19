'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import CalendarView from '@/components/calendar/CalendarView';
import styles from '@/app/(page)/calendar/page.module.scss';
import EmotionDiaryList from '@/components/diary/EmotionDiaryList';
import RecordList from '@/components/calendar/RecordList';
import Tabs from '@/components/ui/Tabs';
import type { DiaryTab } from '@/types/diary';

const tabItems = [
  { id: 'emotion', label: '감정일기' },
  { id: 'record', label: '사건기록' },
] satisfies { id: DiaryTab; label: string }[];

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [activeTab, setActiveTab] = useState<DiaryTab>('emotion');

  return (
    <div>
      <CalendarView onDateChange={setSelectedDate} selectedDate={selectedDate} />

      <div className={styles.summary}>
        <div className={styles['summary__label']}>이달 화해횟수</div>
        <div className={styles['summary__count']}>2번</div>
      </div>

      <div className={styles.diaryMode}>
        <Tabs tabs={tabItems} activeId={activeTab} onChange={(v) => setActiveTab(v as DiaryTab)} />
        <div className={styles.tabContent}>
          {activeTab === 'emotion' && <EmotionDiaryList selectedDate={selectedDate} />}
          {activeTab === 'record' && <RecordList selectedDate={selectedDate} />}
        </div>
      </div>

      {activeTab === 'emotion' && (
        <button className={styles.fab}>
          <span>새 일기</span>
          <span>+</span>
        </button>
      )}
    </div>
  );
}
