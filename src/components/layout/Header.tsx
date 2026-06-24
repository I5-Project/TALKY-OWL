'use client';

import Image from 'next/image';
import Link from 'next/link';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import styles from './Header.module.scss';

type HeaderVariant = 'logo' | 'title';

interface HeaderLogoProps {
  variant: 'logo';
  transparent?: boolean;
  className?: string;
}

interface HeaderTitleProps {
  variant?: 'title';
  title: string;
  subtitle?: string;
  onBack?: () => void;
  transparent?: boolean;
  className?: string;
}

type HeaderProps = HeaderLogoProps | HeaderTitleProps;

export default function Header(props: HeaderProps) {
  if (props.variant === 'logo') {
    return (
      <header
        className={`${styles.header} ${props.transparent ? styles['header--transparent'] : ''} ${props.className ?? ''}`}
      >
        <div className={styles.header__logo}>
          <Link href="/">
            <Image
              src="/images/common/logo.svg"
              alt="말해부엉"
              width={66}
              height={19}
              style={{ objectFit: 'contain' }}
            />
          </Link>
        </div>
      </header>
    );
  }

  const { title, subtitle, onBack, transparent, className } = props;

  return (
    <header className={`${styles.header} ${transparent ? styles['header--transparent'] : ''} ${className ?? ''}`}>
      <div className={styles.header__nav}>
        {onBack && (
          <button className={styles.header__back} onClick={onBack} aria-label="뒤로가기">
            <ChevronLeftRoundedIcon sx={{ fontSize: 24 }} />
          </button>
        )}
        <h1
          className={`${styles.header__title} ${onBack ? styles['header__title--with-back'] : ''}`}
        >
          {title}
        </h1>
      </div>
      {subtitle && <div className={styles.header__subtitle}>{subtitle}</div>}
    </header>
  );
}
