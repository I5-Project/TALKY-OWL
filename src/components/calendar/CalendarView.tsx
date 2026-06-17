'use client';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickerDay } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ko';
import EmotionIcon from './EmotionIcon';
import styles from './CalendarView.module.scss';

type DiaryDaySummary = {
  feel: string;
  count: number;
};

type Props = {
  onDateChange: (date: string) => void;
  selectedDate?: string;
  diaryData?: Record<string, DiaryDaySummary>;
};

type CustomDayProps = React.ComponentProps<typeof PickerDay> & {
  diaryData?: Record<string, DiaryDaySummary>;
};

function CustomDay({ diaryData, ...pickerDayProps }: CustomDayProps) {
  const { day } = pickerDayProps;
  const dateKey = (day as Dayjs).format('YYYY-MM-DD');
  const summary = diaryData?.[dateKey];
  const isSunday = (day as Dayjs).day() === 0;
  const isOutsideMonth = pickerDayProps.outsideCurrentMonth;

  return (
    <div className={styles.dayCell}>
      <PickerDay
        {...pickerDayProps}
        sx={{
          width: 52,
          height: 80,
          borderRadius: 0,
          display: 'flex',
          alignItems: 'flex-start',
          paddingTop: '8px',
          '&:hover': {
            backgroundColor: 'var(--bg-surface-soft)',
          },
          '&.Mui-selected': {
            backgroundColor: 'var(--bg-surface-soft)',
            color: 'var(--text-primary)',
          },
          ...(isSunday && {
            color: 'red',
          }),
        }}
      />

      {summary && !isOutsideMonth && (
        <div className={styles.emotionIcon}>
          <EmotionIcon feel={summary.feel} size={27} count={summary.count} />
        </div>
      )}
    </div>
  );
}

const DUMMY_DIARY_DATA: Record<string, DiaryDaySummary> = {
  '2026-06-03': { feel: '기쁨', count: 1 },
  '2026-06-07': { feel: '슬픔', count: 2 },
  '2026-06-11': { feel: '보통', count: 1 },
  '2026-06-15': { feel: '짜증', count: 3 },
  '2026-06-20': { feel: '화남', count: 1 },
};

export default function CalendarView({
  onDateChange,
  selectedDate,
  diaryData = DUMMY_DIARY_DATA,
}: Props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <div>
        <DateCalendar
          value={selectedDate ? dayjs(selectedDate) : null}
          views={['year', 'month', 'day']}
          onChange={(date) => date && onDateChange(date.format('YYYY-MM-DD'))}
          dayOfWeekFormatter={(day) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][day.day()]}
          slots={{ day: (props) => <CustomDay {...props} diaryData={diaryData} /> }}
          slotProps={{
            calendarHeader: { format: 'YYYY년 M월' },
          }}
          sx={{
            // 달력 루트 기본 레이아웃
            width: '100%',
            minHeight: 600,
            overflow: 'visible',

            // 폰트 전체 적용
            fontFamily: 'var(--font-pretendard), Pretendard, -apple-system, sans-serif',
            '& *': { fontFamily: 'inherit' },

            // 월 슬라이드 전환 시 높이 고정 (레이아웃 밀림 방지)
            '& .MuiDayCalendar-slideTransition': {
              minHeight: 480,
              overflow: 'visible',
            },

            // 년도 선택 뷰
            '& .MuiYearCalendar-root': {
              width: '100%',
              minHeight: 380,
            },

            // 월 선택 뷰
            '& .MuiMonthCalendar-root': {
              width: '100%',
              height: 'auto',
              maxHeight: 'none',
              overflow: 'visible',
            },

            // 헤더 (년/월 텍스트)
            '& .MuiPickersCalendarHeader-root': {
              color: 'var(--text-primary)',
              fontWeight: 500,
            },

            // 요일 헤더 행 (S M T W T F S)
            '& .MuiDayCalendar-header': {
              justifyContent: 'space-around',
              color: 'var(--text-secondary)',
            },
            '&& .MuiDayCalendar-weekDayLabel': {
              width: 52,
              height: 52,
              fontSize: '1rem',
            },

            // 날짜 행
            '& .MuiDayCalendar-weekContainer': {
              justifyContent: 'space-around',
            },
            '& .MuiPickersDay-dayOutsideMonth': {
              width: 52,
              height: 80,
            },

            // 월 이동 좌우 꺽쇠 버튼
            '& .MuiPickersArrowSwitcher-button': {
              color: 'var(--icon-primary)',
            },
            '& .MuiPickersArrowSwitcher-spacer': {
              width: 80,
            },

            // 헤더 아래 꺽쇠 (년/월 뷰 전환)
            '& .MuiPickersCalendarHeader-switchViewButton': {
              color: 'var(--icon-primary)',
            },
          }}
        />
      </div>
    </LocalizationProvider>
  );
}
