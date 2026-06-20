import styles from './StatusBadge.module.scss';

export type DisputeStatus =
  | 'draft'
  | 'waiting_opponent'
  | 'opponent_joined'
  | 'a_submitted'
  | 'both_submitted'
  | 'judging'
  | 'judged'
  | 'closed'
  | 'expired'
  | 'deleted';

type StatusVariant = 'done' | 'progress' | 'disabled' | 'error';

interface StatusBadgeProps {
  status: DisputeStatus;
}

const STATUS_MAP: Record<DisputeStatus, { variant: StatusVariant; label: string }> = {
  draft:             { variant: 'progress', label: '진행중' },
  waiting_opponent:  { variant: 'progress', label: '진행중' },
  opponent_joined:   { variant: 'progress', label: '진행중' },
  a_submitted:       { variant: 'progress', label: '진행중' },
  both_submitted:    { variant: 'progress', label: '진행중' },
  judging:           { variant: 'progress', label: '진행중' },
  judged:            { variant: 'done',     label: '진행완료' },
  closed:            { variant: 'done',     label: '진행완료' },
  expired:           { variant: 'disabled', label: '진행불가' },
  deleted:           { variant: 'error',    label: '진행오류' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { variant, label } = STATUS_MAP[status];

  return (
    <span className={`${styles.badge} ${styles[`badge--${variant}`]}`}>
      {label}
    </span>
  );
}
