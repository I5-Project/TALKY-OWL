'use client';

import CaseCard from '@/components/ui/CaseCard';
import type { CategoryGroup } from '@/types/common';
import styles from './RecordList.module.scss';

type Props = {
  selectedDate: string;
};

interface DummyItem {
  id: number;
  title: string;
  preview: string;
  date: string;
  categoryGroup: CategoryGroup;
  status?: 'progress' | null;
}

const DUMMY_ITEMS: DummyItem[] = [
  {
    id: 1,
    title: '남자친구와 데이트 비용 갈등',
    preview: '매번 제가 더 많이 내는 것 같아서 억울한 마음이 들었어요.',
    date: '2026.06.18',
    categoryGroup: 'romance',
    status: null,
  },
  {
    id: 2,
    title: '팀장님 업무 지시 방식 문제',
    preview: '갑작스러운 야근 요청이 너무 잦아서 힘들었어요.',
    date: '2026.06.15',
    categoryGroup: 'work',
    status: null,
  },
];

export default function RecordList({ selectedDate }: Props) {
  // TODO: selectedDate 기반 API 연동 시 DUMMY_ITEMS 대체
  const items = DUMMY_ITEMS;

  if (items.length === 0) {
    return <div className={styles.empty}>등록한 기록이 없어요</div>;
  }

  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.id}>
          <CaseCard
            title={item.title}
            preview={item.preview}
            date={item.date}
            categoryGroup={item.categoryGroup}
            status={item.status ?? null}
          />
        </li>
      ))}
    </ul>
  );
}
