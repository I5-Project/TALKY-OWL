'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import CalendarView from '@/components/calendar/CalendarView';
import DiaryMode from '@/components/calendar/DiaryMode';
import styles from './page.module.scss';

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));

  return (
    <div>
      <CalendarView onDateChange={setSelectedDate} />

      <div className={styles.summary}>
        <div className={styles['summary__label']}>이달 화해횟수</div>
        <div className={styles['summary__count']}>2번</div>
      </div>

      <div className={styles.diary}>
        <DiaryMode selectedDate={selectedDate} />
      </div>
    </div>
  );
}
