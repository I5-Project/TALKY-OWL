'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from './HomeServiceInfo.module.scss'

const LINKS = [
  { label: '서비스 소개', href: '#' },
  { label: '개인정보 처리방침', href: '/privacy' },
  { label: '이용약관', href: '/terms' },
  { label: '고객문의', href: '#' },
]

export default function HomeServiceInfo() {
  const [logoError, setLogoError] = useState(false)

  return (
    <div className={styles.box}>
      {logoError ? (
        <span className={styles.logoFallback}>말해부엉</span>
      ) : (
        <Image
          src="/images/common/logo.png"
          alt="말해부엉"
          width={66}
          height={19}
          className={styles.logo}
          onError={() => setLogoError(true)}
        />
      )}
      <nav className={styles.links} aria-label="서비스 정보">
        {LINKS.map(({ label, href }) => (
          <a key={label} href={href} className={styles.link}>

          </a>
        ))}
      </nav>
      <p className={styles.copyright}>Copyright ⓒ 말해부엉. ALL Rights Reserved.</p>
    </div>
  )
}
