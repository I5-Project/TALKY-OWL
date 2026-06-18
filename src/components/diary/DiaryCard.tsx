'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './DiaryCard.module.scss';

export type EmotionType = 'happy' | 'sad' | 'angry' | 'annoyed' | 'neutral';

interface DiaryCardProps {
  id: string;
  title: string;
  content: string;
  date: string;
  emotionType: EmotionType;
  onClick?: () => void;
}

export default function DiaryCard({ id, title, content, date, emotionType, onClick }: DiaryCardProps) {
  return (
    <Link
      href={`/diary/${id}`}
      className={styles.card}
      data-emotion={emotionType}
      onClick={onClick}
    >
      <p className={styles.card__title}>{title}</p>
      <p className={styles.card__content}>{content}</p>
      <div className={styles.card__footer}>
        <time className={styles.card__date}>{date}</time>
        <Image
          src={`/images/icons/emotions/emotion-${emotionType}.svg`}
          alt={emotionType}
          width={24}
          height={24}
          className={styles.card__emotion}
        />
      </div>
    </Link>
  );
}
