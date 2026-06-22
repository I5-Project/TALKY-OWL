'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import Header from '@/components/layout/Header';
import CalendarView from '@/components/calendar/CalendarView';
import styles from '@/app/(page)/calendar/page.module.scss';
import EmotionDiaryList from '@/components/diary/EmotionDiaryList';
import RecordList from '@/components/calendar/RecordList';
import Tabs from '@/components/ui/Tabs';
import { useCalendarRecords } from '@/domains/calendar/calendar.hooks';
import Spinner from '@/components/ui/Spinner';
import type { DiaryTab } from '@/types/diary';

const tabItems = [
  { id: 'emotion', label: '감정일기' },
  { id: 'record', label: '사건기록' },
] satisfies { id: DiaryTab; label: string }[];

export default function Calendar() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [activeTab, setActiveTab] = useState<DiaryTab>('emotion');

  const currentYear = dayjs(selectedDate).year();
  const currentMonth = dayjs(selectedDate).month() + 1; // dayjs month는 0부터 시작
  const { data: calendarData, isLoading } = useCalendarRecords(currentYear, currentMonth);

  const monthlyDisputeCount = calendarData?.records.reduce(
    (sum, r) => sum + (r.dispute?.count ?? 0), 0
  ) ?? 0;

  return (
    <div>
      <Header variant="logo" />
      <div className={styles.calendarWrapper}>
        <CalendarView
          onDateChange={setSelectedDate}
          selectedDate={selectedDate}
          calendarData={calendarData?.records ?? []}
        />
        {isLoading && (
          <div className={styles.calendarOverlay}>
            <Spinner />
          </div>
        )}
      </div>

      <div className={styles.summary}>
        <div className={styles['summary__label']}>이달 화해횟수</div>
        <div className={styles['summary__count']}>
          {isLoading ? '불러오는 중...' : `${monthlyDisputeCount}번`}
        </div>
      </div>

      <div className={styles.diaryMode}>
        <Tabs tabs={tabItems} activeId={activeTab} onChange={(v) => setActiveTab(v as DiaryTab)} />
        <div className={styles.tabContent}>
          {activeTab === 'emotion' && <EmotionDiaryList selectedDate={selectedDate} />}
          {activeTab === 'record' && <RecordList selectedDate={selectedDate} />}
        </div>
      </div>

      {activeTab === 'emotion' && (
        <button className={styles.fab} onClick={() => router.push('/diary/create')}>
          <span>새 일기</span>
          <span>+</span>
        </button>
      )}
    </div>
  );
}
