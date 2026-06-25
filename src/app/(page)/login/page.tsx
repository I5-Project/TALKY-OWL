'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Button from '@/components/ui/Button';
import styles from './login.module.scss';

function toRelativePath(url: string): string {
  try {
    const parsed = new URL(url, 'http://placeholder');
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return '/';
  }
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const raw = searchParams.get('callbackUrl');
  const returnTo = raw ? toRelativePath(raw) : null;
  const callbackUrl = returnTo
    ? `/auth/callback?callbackUrl=${encodeURIComponent(returnTo)}`
    : '/auth/callback';

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.logo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/common/login_character.svg"
            alt="말해부엉 캐릭터"
            className={styles.character}
          />
          <Image
            src="/images/common/logo.svg"
            alt="말해부엉"
            width={264}
            height={76}
            sizes="(max-width: 667px) 45vw, 200px"
            className={styles.logoImage}
          />
        </div>
      </div>

      <div className={styles.footer}>
        <Button className={styles.kakaoButton} onClick={() => signIn('kakao', { callbackUrl })}>
          <Image src="/images/common/logo_kakao.svg" alt="" width={20} height={20} aria-hidden />
          카카오로 로그인 하기
        </Button>
        <p className={styles.disclaimer}>
          소셜 로그인 가입 시 본{' '}
          <Link href="/terms" className={styles.disclaimerLink}>
            서비스이용약관
          </Link>{' '}
          및{' '}
          <Link href="/privacy" className={styles.disclaimerLink}>
            개인정보처리방침
          </Link>
          에 동의하시는 것으로 간주됩니다
        </p>
      </div>
    </div>
  );
}
