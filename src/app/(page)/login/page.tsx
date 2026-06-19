'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Button from '@/components/ui/Button';
import styles from './login.module.scss';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('callbackUrl');
  const callbackUrl = returnTo
    ? `/auth/callback?callbackUrl=${encodeURIComponent(returnTo)}`
    : '/auth/callback';

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.logo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/common/login_character.png"
            alt="말해부엉 캐릭터"
            className={styles.character}
          />
          <Image
            src="/images/common/logo.png"
            alt="말해부엉"
            width={264}
            height={76}
            sizes="(max-width: 667px) 45vw, 200px"
            className={styles.logoImage}
          />
        </div>
      </div>

      <div className={styles.footer}>
        <Button
          className={styles.kakaoButton}
          onClick={() => signIn('kakao', { callbackUrl })}
        >
          <KakaoIcon />
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

function KakaoIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 1.5C4.858 1.5 1.5 4.134 1.5 7.38c0 2.1 1.395 3.942 3.498 4.998L4.1 15.228a.188.188 0 0 0 .288.204l3.726-2.472A8.8 8.8 0 0 0 9 13.26c4.142 0 7.5-2.634 7.5-5.88S13.142 1.5 9 1.5Z"
        fill="#000000"
      />
    </svg>
  );
}
