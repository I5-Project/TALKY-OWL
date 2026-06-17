import type { CategoryGroup } from '@/types/common';
import CategoryIcon from './CategoryIcon';
import styles from './CaseCard.module.scss';

type CaseCardStatus = 'progress' | null;

interface CaseCardProps {
  title: string;
  preview: string;
  date: string;
  categoryGroup?: CategoryGroup;
  status?: CaseCardStatus;
  onClick?: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  progress: '진행중',
};

export default function CaseCard({
  title,
  preview,
  date,
  categoryGroup,
  status = null,
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
        {categoryGroup && (
          <span className={styles.card__icon} aria-hidden="true">
            <CategoryIcon category={categoryGroup} />
          </span>
        )}
        {status && (
          <span
            className={`${styles.card__badge} ${styles[`card__badge--${status}`]}`}
          >
            {STATUS_LABEL[status]}
          </span>
        )}
      </div>
      <h3 className={styles.card__title}>{title}</h3>
      <p className={styles.card__preview}>{preview}</p>
      <time className={styles.card__date}>{date}</time>
    </article>
  );
}
