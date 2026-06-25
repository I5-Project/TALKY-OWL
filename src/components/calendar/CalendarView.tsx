'use client';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickerDay } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ko';
import EmotionIcon from '@/components/calendar/EmotionIcon';
import CategoryIcon from '@/components/ui/CategoryIcon';
import styles from '@/components/calendar/CalendarView.module.scss';
import type { CalendarViewProps } from '@/types/diary';
import type { CalendarRecordItem } from '@/types/calendar';
import type { CategoryGroup } from '@/types/common';

// DB 영문 emotion_type → EmotionIcon이 기대하는 한글 Feel 매핑
const EMOTION_TYPE_TO_FEEL: Record<string, string> = {
  happy: '기쁨',
  sad: '슬픔',
  neutral: '보통',
  annoyed: '짜증',
  angry: '화남',
};

type CustomDayProps = React.ComponentProps<typeof PickerDay> & {
  recordMap?: Map<string, CalendarRecordItem>;
};

function CustomDay({ recordMap, ...pickerDayProps }: CustomDayProps) {
  const { day } = pickerDayProps;
  const dateKey = (day as Dayjs).format('YYYY-MM-DD');
  const record = recordMap?.get(dateKey);
  const isOutsideMonth = pickerDayProps.outsideCurrentMonth;
  const isSunday = (day as Dayjs).day() === 0;

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
          '&:hover': { backgroundColor: 'var(--bg-surface-soft)' },
          '&.Mui-selected': {
            backgroundColor: 'var(--bg-surface-soft)',
            color: 'var(--text-primary)',
          },
          ...(isSunday && { color: 'red' }),
        }}
      />

      {/* 이 날짜에 기록이 있고 이전 달/다음 달 날짜가 아닐 때만 아이콘 표시 */}
      {record && !isOutsideMonth && (
        <div className={styles.emotionIcon}>
          {/* 감정일기가 있으면 감정 이모티콘 + 개수 */}
          {record.diary && (
            <EmotionIcon
              feel={EMOTION_TYPE_TO_FEEL[record.diary.emotion] ?? record.diary.emotion}
              size={27}
              count={record.diary.count}
            />
          )}
          {/* 종료된 사건이 있으면 카테고리 아이콘 + 개수 */}
          {record.dispute && (
            <CategoryIcon
              category={record.dispute.category as CategoryGroup}
              count={record.dispute.count}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function CalendarView({
  onDateChange,
  selectedDate,
  calendarData = [],
}: CalendarViewProps) {
  // 배열을 Map으로 변환 → CustomDay에서 O(1) 날짜 조회
  const recordMap = new Map(calendarData.map((r) => [r.date, r]));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <div>
        <DateCalendar
          value={selectedDate ? dayjs(selectedDate) : null}
          views={['year', 'month', 'day']}
          onChange={(date) => date && onDateChange(date.format('YYYY-MM-DD'))}
          onMonthChange={(date) => onDateChange(date.startOf('month').format('YYYY-MM-DD'))}
          dayOfWeekFormatter={(day) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][day.day()]}
          slots={{ day: (props) => <CustomDay {...props} recordMap={recordMap} /> }}
          slotProps={{
            calendarHeader: { format: 'YYYY년 M월' },
          }}
          sx={{
            width: '100%',
            overflow: 'visible',
            fontFamily: 'var(--font-pretendard), Pretendard, -apple-system, sans-serif',
            '& *': { fontFamily: 'inherit' },

            '& .MuiDayCalendar-slideTransition': {
              // minHeight: 512,
              overflow: 'visible',
            },

            '& .MuiYearCalendar-root': { width: '100%', minHeight: 380 },
            '& .MuiMonthCalendar-root': {
              width: '100%',
              height: 'auto',
              maxHeight: 'none',
              overflow: 'visible',
            },

            '& .MuiPickersCalendarHeader-root': {
              color: 'var(--text-primary)',
              fontWeight: 500,
            },

            '& .MuiDayCalendar-header': {
              justifyContent: 'space-around',
              color: 'var(--text-secondary)',
            },
            '&& .MuiDayCalendar-weekDayLabel': { width: 52, height: 52, fontSize: '1rem' },

            '& .MuiDayCalendar-weekContainer': { justifyContent: 'space-around' },
            '& .MuiPickersDay-dayOutsideMonth': { width: 52, height: 80 },

            '& .MuiPickersArrowSwitcher-button': { color: 'var(--icon-primary)' },
            '& .MuiPickersArrowSwitcher-spacer': { width: 80 },
            '& .MuiPickersCalendarHeader-switchViewButton': { color: 'var(--icon-primary)' },

            '& .MuiYearCalendar-button.Mui-selected': {
              backgroundColor: 'var(--bg-surface-soft)',
              color: 'var(--text-primary)',
            },
            '& .MuiMonthCalendar-button.Mui-selected': {
              backgroundColor: 'var(--bg-surface-soft)',
              color: 'var(--text-primary)',
            },
          }}
        />
      </div>
    </LocalizationProvider>
  );
}
