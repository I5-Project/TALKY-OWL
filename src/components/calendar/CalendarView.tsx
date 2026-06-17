'use client';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickerDay } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/ko';
import EmotionIcon from './EmotionIcon';

type DiaryDaySummary = {
  feel: string;
  count: number;
};

type Props = {
  onDateChange: (date: string) => void;
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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 52,
        height: 80,
        paddingTop: 4,
        gap: 2,
      }}
    >
      <PickerDay
        {...pickerDayProps}
        sx={{
          width: 36,
          height: 36,
          fontSize: '0.9rem',
          flexShrink: 0,
          ...(isSunday && { color: 'red' }),
        }}
      />
      {summary && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <EmotionIcon feel={summary.feel} size={18} />
          {summary.count > 1 && (
            <span style={{ fontSize: 10, color: '#888', lineHeight: 1 }}>
              +{summary.count - 1}
            </span>
          )}
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

export default function CalendarView({ onDateChange, diaryData = DUMMY_DIARY_DATA }: Props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <DateCalendar
        value={null}
        onChange={(date) => date && onDateChange(date.format('YYYY-MM-DD'))}
        dayOfWeekFormatter={(day) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][day.day()]}
        slots={{ day: (props) => <CustomDay {...props} diaryData={diaryData} /> }}
        slotProps={{
          calendarHeader: { format: 'YYYY년 M월' },
        }}
        sx={{
          width: '100%',
          '& .MuiPickersCalendarHeader-root': {
            backgroundColor: 'rgba(255,165,0,0.3)',
          },
          '& .MuiDayCalendar-header': {
            justifyContent: 'space-around',
            color: 'var(--text-secondary)',
            backgroundColor: 'rgba(255,255,0,0.3)',
          },
          '& .MuiDayCalendar-weekContainer': {
            justifyContent: 'space-around',
          },
          '& .MuiPickersDay-dayOutsideMonth': {
            width: 52,
            height: 80,
          },
          '&& .MuiDayCalendar-weekDayLabel': {
            width: 52,
            height: 52,
            fontSize: '1rem',
            backgroundColor: 'rgba(255,0,255,0.2)',
          },
        }}
      />
    </LocalizationProvider>
  );
}
