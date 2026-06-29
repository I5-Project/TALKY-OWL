'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useHeaderStore } from '@/stores/headerStore';
import { useToastStore } from '@/stores/toastStore';
import Avatar from '@/components/ui/Avatar';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useUserMe } from '@/domains/user/hooks';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Chatbot from '@/components/chatbot/Chatbot';
import styles from './page.module.scss';

const PREPARING_ITEMS = ['shop'] as const;
type PreparingKey = (typeof PREPARING_ITEMS)[number];

const LINK_ITEMS = [
  { key: 'shop', label: '상점', href: '/shop' },
  { key: 'about', label: '서비스 소개', href: '/about' },
  { key: 'privacy', label: '개인정보처리방침', href: '/privacy' },
  { key: 'terms', label: '이용약관', href: '/terms' },
] as const;

export default function MyPage() {
  const setHeader = useHeaderStore((s) => s.setHeader);
  useEffect(() => {
    setHeader({ variant: 'logo' });
    return () => setHeader(null);
  }, []);
  const router = useRouter();
  const { data: user } = useUserMe();
  const showToast = useToastStore((s) => s.show);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const isPreparing = (key: string): key is PreparingKey =>
    (PREPARING_ITEMS as readonly string[]).includes(key);

  const displayName = user?.nickname ?? user?.name ?? '';

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <>
      <main className={styles.main}>
        <section className={styles.profile}>
          <div className={styles.profile__wrapper}>
            <Avatar size="l" src={user?.profileImageUrl ?? undefined} />
            <div className={styles.profile__info}>
              <span className={styles.profile__name}>{displayName}</span>
              <span className={styles.profile__badge}>{user?.mbti ?? 'MBTI를 설정해주세요'}</span>
            </div>
          </div>
          <Link href="/mypage/edit" className={styles.profile__setting} aria-label="설정">
            <SettingsRoundedIcon sx={{ fontSize: 24 }} />
          </Link>
        </section>

        <nav className={styles.menu}>
          <button type="button" className={styles.menu__item} onClick={() => setLogoutOpen(true)}>
            <span className={styles.menu__label}>로그아웃</span>
            <ChevronRightRoundedIcon className={styles.menu__arrow} />
          </button>
          {LINK_ITEMS.map((item) =>
            isPreparing(item.key) ? (
              <button
                key={item.key}
                type="button"
                className={styles.menu__item}
                onClick={() => showToast('준비중입니다.')}
              >
                <span className={styles.menu__label}>{item.label}</span>
                <ChevronRightRoundedIcon className={styles.menu__arrow} sx={{ fontSize: 24 }} />
              </button>
            ) : (
              <Link key={item.key} href={item.href} className={styles.menu__item}>
                <span className={styles.menu__label}>{item.label}</span>
                <ChevronRightRoundedIcon className={styles.menu__arrow} sx={{ fontSize: 24 }} />
              </Link>
            ),
          )}

          <button
            type="button"
            className={`${styles.menu__item} ${styles['menu__item--danger']}`}
            onClick={() => router.push('/mypage/withdraw')}
          >
            <span className={styles.menu__label}>회원탈퇴</span>
            <ChevronRightRoundedIcon className={styles.menu__arrow} sx={{ fontSize: 24 }} />
          </button>
        </nav>
      </main>

      <ConfirmModal
        open={logoutOpen}
        message="정말 로그아웃 하시겠어요?"
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />

      <Chatbot />
    </>
  );
}
