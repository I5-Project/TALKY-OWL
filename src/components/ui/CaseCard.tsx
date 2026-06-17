import styles from './CaseCard.module.scss';

type CaseCardStatus = 'progress' | null;

interface CaseCardProps {
  title: string;
  preview: string;
  date: string;
  categoryGroup?: string;
  status?: CaseCardStatus;
  onClick?: () => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  ROMANCE: '🖤',
  FAMILY: '🏠',
  FRIEND: '🤝',
  WORK: '💼',
};

const STATUS_LABEL: Record<string, string> = {
  progress: '진행중',
};

export default function CaseCard({
  title,
  preview,
  date,
  categoryGroup = 'ROMANCE',
  status = null,
  onClick,
}: CaseCardProps) {
  const emoji = CATEGORY_EMOJI[categoryGroup] ?? '📋';

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
        <span className={styles.card__icon} aria-hidden="true">
          {emoji}
        </span>
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
