'use client';

import styles from './RecordList.module.scss';

type Props = {
  selectedDate: string;
};

export default function RecordList({ selectedDate }: Props) {
  //api 로직 구현할 때 사용 selectedDate
  const items: [] = [];

  if (items.length === 0) {
    return <div className={styles.empty}>등록한 기록이 없어요</div>;
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item}>...</li>
      ))}
    </ul>
  );
}
