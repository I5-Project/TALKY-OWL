import type { CategoryGroup } from '@/types/common';
import Avatar, { AvatarGroup } from './Avatar';
import CategoryIcon from './CategoryIcon';
import styles from './CaseCard.module.scss';

type CaseCardStatus = 'progress' | null;

type Participant = {
  role: 'role_a' | 'role_b';
  user: {
    nickname: string | null;
    profileImageUrl: string | null;
  };
};

interface CaseCardProps {
  title: string;
  preview: string;
  date: string;
  categoryGroup?: CategoryGroup;
  status?: CaseCardStatus;
  participants?: Participant[];
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
  participants,
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
        {status && (
          <span
            className={`${styles.card__badge} ${styles[`card__badge--${status}`]}`}
          >
            {STATUS_LABEL[status]}
          </span>
        )}
      </div>
      <p className={styles.card__preview}>{preview}</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <time className={styles.card__date}>{date}</time>
        {participants && participants.length > 0 && (
          <AvatarGroup size="s" max={2}>
            {participants.map((p) => (
              <Avatar
                key={p.role}
                src={p.user.profileImageUrl ?? undefined}
                alt={p.user.nickname ?? '참여자'}
                size="s"
              />
            ))}
          </AvatarGroup>
        )}
      </div>
    </article>
  );
}
