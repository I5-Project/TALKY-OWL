'use client';

import Image from 'next/image';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import styles from './Header.module.scss';

type HeaderVariant = 'logo' | 'title';

interface HeaderLogoProps {
  variant: 'logo';
}

interface HeaderTitleProps {
  variant?: 'title';
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

type HeaderProps = HeaderLogoProps | HeaderTitleProps;

export default function Header(props: HeaderProps) {
  if (props.variant === 'logo') {
    return (
      <header className={styles.header}>
        <div className={styles.header__logo}>
          <Image
            src="/images/common/logo.png"
            alt="말해부엉"
            width={66}
            height={19}
            style={{ objectFit: 'contain' }}
          />
        </div>
      </header>
    );
  }

  const { title, subtitle, onBack } = props;

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
