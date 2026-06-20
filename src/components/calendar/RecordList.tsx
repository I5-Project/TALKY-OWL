'use client';

import Link from 'next/link';
import CaseCard from '@/components/ui/CaseCard';
import Avatar from '@/components/ui/Avatar';
import StatusBadge from '@/components/ui/StatusBadge';
import { useDisputesByDate } from '@/domains/dispute/dispute.hooks';
import type { DisputeStatus } from '@/components/ui/StatusBadge';
import styles from '@/components/calendar/RecordList.module.scss';

type Props = {
  selectedDate: string;
};

function formatDate(dateStr: string): string {
  return dateStr.slice(2, 10);
}

export default function RecordList({ selectedDate }: Props) {
  const { data, isLoading } = useDisputesByDate(selectedDate, 'closed');

  if (isLoading) return <div className={styles.empty}>불러오는 중...</div>;

  const disputes = data?.disputes ?? [];

  if (disputes.length === 0) {
    return <div className={styles.empty}>등록한 기록이 없어요</div>;
  }

  return (
    <ul className={styles.list}>
      {disputes.map((dispute) => (
        <li key={dispute.id}>
          <Link href={`/disputes/${dispute.id}`} className={styles.cardWrapper}>
            <CaseCard
              title={dispute.title}
              preview={dispute.description ?? ''}
              categoryGroup={dispute.categoryGroup}
              date={formatDate(dispute.createdAt)}
            />
            <div className={styles.cardFooter}>
              <div className={styles.cardFooterLeft}>
                <Avatar src={dispute.participants[0]?.profileImageUrl ?? undefined} alt="참여자" size="s" />
                <time className={styles.cardDate}>{formatDate(dispute.createdAt)}</time>
              </div>
              <StatusBadge status={dispute.status as DisputeStatus} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
