import type { CategoryGroup } from '@/types/common';
import CategoryIcon from './CategoryIcon';
import StatusBadge, { type DisputeStatus } from './StatusBadge';
import styles from './CaseCard.module.scss';

interface CaseCardProps {
  title: string;
  preview: string;
  date: string;
  categoryGroup?: CategoryGroup;
  disputeStatus?: DisputeStatus;
  status?: 'progress' | null;
  onClick?: () => void;
}

export default function CaseCard({
  title,
  preview,
  date,
  categoryGroup,
  disputeStatus,
  onClick,
}: CaseCardProps) {
  return (
    <article
      className={[
        styles.card,
        onClick ? styles['card--clickable'] : '',
      ].join(' ')}
      onClick={onClick}
      {...(onClick ? { role: 'button', tabIndex: 0 } : {})}
    >
      <div className={styles.card__header}>
        <div className={styles.card__titleRow}>
          {categoryGroup && (
            <span className={styles.card__icon} aria-hidden="true">
              <CategoryIcon category={categoryGroup} />
            </span>
          )}
          <h3 className={styles.card__title}>{title}</h3>
        </div>
      </div>
      <p className={styles.card__preview}>{preview}</p>
      {disputeStatus ? (
        <div className={styles.card__footer}>
          <time className={styles.card__date}>{date}</time>
          <StatusBadge status={disputeStatus} />
        </div>
      ) : (
        <time className={styles.card__date}>{date}</time>
      )}
    </article>
  );
}
