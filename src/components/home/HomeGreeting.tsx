'use client';

import { useUserMe } from '@/domains/user/hooks';
import styles from '@/app/(page)/page.module.scss';

export default function HomeGreeting() {
  const { data: user } = useUserMe();

  const displayName = user?.name ?? user?.nickname;
  const greeting = displayName ? `${displayName}님` : '안녕하세요';

  return (
    <section className={styles.greeting}>
      <p className={styles.greetingText}>
        <span className={styles.userName}>{greeting}</span>
        <br />
        오늘 감정은 어떠신가요?
      </p>
    </section>
  );
}
