import Image from 'next/image';
import styles from './HomeServiceInfo.module.scss';

const LINKS = [
  { label: '서비스 소개', href: '/about' },
  { label: '개인정보 처리방침', href: '/privacy' },
  { label: '이용약관', href: '/terms' },
];

export default function HomeServiceInfo() {
  return (
    <div className={styles.box}>
      <Image
        src="/images/common/logo.svg"
        alt="말해부엉"
        width={66}
        height={19}
        className={styles.logo}
      />
      <nav className={styles.links} aria-label="서비스 정보">
        {LINKS.map(({ label, href }) =>
          href ? (
            <a key={label} href={href} className={styles.link}>
              {label}
            </a>
          ) : (
            <span key={label} className={styles.link} aria-disabled="true">
              {label}
            </span>
          ),
        )}
      </nav>
      <p className={styles.copyright}>Copyright ⓒ 말해부엉. ALL Rights Reserved.</p>
    </div>
  );
}
