import Image from 'next/image';
import styles from './loading.module.scss';

export default function Loading() {
  return (
    <main className={styles.container}>
      <Image
        src="/images/characters/character-loading.svg"
        alt="로딩 중"
        width={120}
        height={120}
        className={styles.owl}
        priority
      />
    </main>
  );
}
