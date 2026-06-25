'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './callback.module.scss';

export default function AuthCallbackPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === 'authenticated') {
      let callbackUrl = '/';
      const raw = searchParams.get('callbackUrl');
      if (raw) {
        try {
          const path = new URL(raw, window.location.origin).pathname;
          if (path && path !== '/auth/callback' && !path.startsWith('//')) {
            callbackUrl = path;
          }
        } catch {
          /* invalid URL */
        }
      }
      router.replace(callbackUrl);
    }

    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router, searchParams]);

  return (
    <div className={styles.page}>
      <div className={styles.spinner} />
      <p className={styles.text}>로그인 처리 중...</p>
    </div>
  );
}
