'use client'

import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import styles from './not-found.module.scss'

export default function NotFound() {
  const router = useRouter()

  return (
    <main className={styles.page}>
      <Header variant="logo" />
      <div className={styles.content}>
        <div className={styles.character}>
          <img src="/images/characters/character-error.svg" alt="" width={220} height={220} />
        </div>
        <div className={styles.textGroup}>
          <h1 className={styles.title}>{'페이지를 찾을 수 없어요'}</h1>
          <p className={styles.desc}>주소가 잘못됐거나 더 이상 존재하지 않는 페이지예요.</p>
        </div>
      </div>
      <div className={styles.footer}>
        <Button onClick={() => router.back()}>
          이전 페이지로 이동하기
        </Button>
      </div>
    </main>
  )
}
