import CalendarView from '@/components/calendar/CalendarView';
import DiaryMode from '@/components/calendar/DiaryMode';
import "./page.scss";

export default function calendar() {
  return (
    <div>
      <CalendarView />
      <div className={"month-closed-number"}>
        <div>이달 화해횟수</div>
        <div>2번</div>
      </div>
      <div>
        <DiaryMode />
      </div>
    </div>
  );
}
