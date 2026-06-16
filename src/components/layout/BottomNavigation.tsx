'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpenText, CalendarDays, User } from 'lucide-react';
import styles from './BottomNavigation.module.scss';

const NAV_ITEMS = [
  { href: '/home', label: '홈', icon: Home },
  { href: '/records', label: '사건기록', icon: BookOpenText },
  { href: '/diary', label: '일기', icon: CalendarDays },
  { href: '/mypage', label: '마이페이지', icon: User },
] as const;

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <ul className={styles.nav__list}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <li key={href} className={styles.nav__item}>
              <Link
                href={href}
                className={`${styles.nav__link} ${isActive ? styles['nav__link--active'] : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={24} />
                <span className={styles.nav__label}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
