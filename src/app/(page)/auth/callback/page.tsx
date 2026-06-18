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
      const raw = searchParams.get('callbackUrl');
      const callbackUrl =
        raw && raw.startsWith('/') && !raw.startsWith('//') && !raw.startsWith('/auth/callback')
          ? raw
          : '/';
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
