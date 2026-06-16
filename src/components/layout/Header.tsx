'use client';

import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import styles from './Header.module.scss';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export default function Header({ title, subtitle, onBack }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.header__nav}>
        {onBack && (
          <button
            className={styles.header__back}
            onClick={onBack}
            aria-label="뒤로가기"
          >
            <ChevronLeftRoundedIcon sx={{ fontSize: 24 }} />
          </button>
        )}
        <h1
          className={`${styles.header__title} ${onBack ? styles['header__title--with-back'] : ''}`}
        >
          {title}
        </h1>
      </div>
      {subtitle && (
        <div className={styles.header__subtitle}>{subtitle}</div>
      )}
    </header>
  );
}
