'use client'

import { useUserMe } from '@/domains/user/hooks'
import styles from '@/app/page.module.scss'

export default function HomeGreeting() {
  const { data: user } = useUserMe()

  const displayName = user?.name ?? user?.nickname
  const greeting = displayName ? `${displayName}님` : '안녕하세요'

  return (
    <section className={styles.greeting}>
      <p className={styles.userName}>{greeting}</p>
      <p className={styles.greetingText}>오늘 감정은 어떠신가요?</p>
    </section>
  )
}
