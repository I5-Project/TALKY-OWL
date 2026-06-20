'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import Avatar from '@/components/ui/Avatar';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useUserMe } from '@/domains/user/hooks';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import styles from './page.module.scss';

const LINK_ITEMS = [
  { key: 'shop', label: '상점', href: '/shop' },
  { key: 'about', label: '서비스 소개', href: '/about' },
  { key: 'privacy', label: '개인정보처리방침', href: '/privacy' },
  { key: 'terms', label: '이용약관', href: '/terms' },
  { key: 'contact', label: '고객문의', href: '/contact' },
] as const;

export default function MyPage() {
  const router = useRouter();
  const { data: user } = useUserMe();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const displayName = user?.name ?? user?.nickname ?? '';

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const handleWithdraw = () => {
    setWithdrawOpen(false);
    router.push('/mypage/withdraw');
  };

  return (
    <>
      <Header variant="logo" />
      <main className={styles.main}>
        <section className={styles.profile}>
          <Avatar size="l" />
          <div className={styles.profile__info}>
            <span className={styles.profile__name}>{displayName}</span>
            {user?.mbti && <span className={styles.profile__badge}>{user.mbti}</span>}
          </div>
          <Link href="/mypage/edit" className={styles.profile__setting} aria-label="설정">
            <SettingsRoundedIcon sx={{ fontSize: 24 }} />
          </Link>
        </section>

        <nav className={styles.menu}>
          <button
            type="button"
            className={styles.menu__item}
            onClick={() => setLogoutOpen(true)}
          >
            <span className={styles.menu__label}>로그아웃</span>
            <ChevronRightRoundedIcon className={styles.menu__arrow} />
          </button>

          {LINK_ITEMS.map(item => (
            <Link key={item.key} href={item.href} className={styles.menu__item}>
              <span className={styles.menu__label}>{item.label}</span>
              <ChevronRightRoundedIcon className={styles.menu__arrow} />
            </Link>
          ))}

          <button
            type="button"
            className={`${styles.menu__item} ${styles['menu__item--danger']}`}
            onClick={() => setWithdrawOpen(true)}
          >
            <span className={styles.menu__label}>회원탈퇴</span>
            <ChevronRightRoundedIcon className={styles.menu__arrow} />
          </button>
        </nav>
      </main>

      <BottomNavigation />

      <ConfirmModal
        open={logoutOpen}
        message="정말 로그아웃 하시겠어요?"
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
      <ConfirmModal
        open={withdrawOpen}
        message="정말 탈퇴 하시겠어요?"
        onClose={() => setWithdrawOpen(false)}
        onConfirm={handleWithdraw}
      />
    </>
  );
}
