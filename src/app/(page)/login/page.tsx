'use client';

import Image from 'next/image';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import Button from '@/components/ui/Button';
import styles from './login.module.scss';

export default function LoginPage() {
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
          onClick={() => signIn('kakao', { callbackUrl: '/' })}
        >
          <KakaoTalkIcon />
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

function KakaoTalkIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 3C6.477 3 2 6.463 2 10.691c0 2.722 1.81 5.104 4.533 6.454l-1.15 4.197a.307.307 0 0 0 .47.334l4.833-3.207c.43.04.864.063 1.314.063 5.523 0 10-3.463 10-7.841C22 6.463 17.523 3 12 3Z"
        fill="#000000"
      />
      <text
        x="12"
        y="12.2"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#FFE812"
        fontSize="5.5"
        fontWeight="800"
        fontFamily="Arial, sans-serif"
        letterSpacing="0.3"
      >
        TALK
      </text>
    </svg>
  );
}
