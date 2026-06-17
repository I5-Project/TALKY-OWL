'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import styles from './BottomNavigation.module.scss';

const NAV_ITEMS = [
  { href: '/home', label: '홈', Icon: HomeRoundedIcon },
  { href: '/records', label: '사건기록', Icon: GavelRoundedIcon },
  { href: '/diary', label: '일기', Icon: CalendarMonthRoundedIcon },
  { href: '/mypage', label: '마이페이지', Icon: PersonRoundedIcon },
] as const;

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <ul className={styles.nav__list}>
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <li key={href} className={styles.nav__item}>
              <Link
                href={href}
                className={`${styles.nav__link} ${isActive ? styles['nav__link--active'] : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon sx={{ fontSize: 24 }} />
                <span className={styles.nav__label}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
