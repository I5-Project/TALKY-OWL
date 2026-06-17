'use client';


type Props = {
  selectedDate: string;
};

export default function EmotionDiaryList({ selectedDate}: Props) {
  // TODO: TanStack Query 연동 (API 스펙 확정 후)
  const items: [] = [];

  if (items.length === 0) {
    return <div>등록한 일기가 없어요 {selectedDate}</div>;
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item}>...</li>
      ))}
    </ul>
  );
}
