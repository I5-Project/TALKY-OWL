'use client';


type Props = {
  selectedDate: string;
};

export default function EmotionDiaryList({ selectedDate}: Props) {
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
