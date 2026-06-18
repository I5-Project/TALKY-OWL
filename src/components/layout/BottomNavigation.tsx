'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import styles from './BottomNavigation.module.scss';

const NAV_ITEMS = [
  { href: '/', label: '홈', Icon: HomeIcon },
  { href: '/records', label: '사건기록', Icon: MenuBookIcon },
  { href: '/diary', label: '일기', Icon: CalendarMonthIcon },
  { href: '/mypage', label: '마이페이지', Icon: PersonIcon },
] as const;

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <ul className={styles.nav__list}>
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
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
