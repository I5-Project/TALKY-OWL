'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import styles from './not-found.module.scss'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  return (
    <main className={styles.page}>
      <Header variant="logo" />
      <div className={styles.content}>
        <div className={styles.character}>
          <Image src="/images/characters/character-error.svg" alt="" width={220} height={220} />
        </div>
        <div className={styles.textGroup}>
          <h1 className={styles.title}>{'일시적인 오류가\n발생했어요'}</h1>
          <p className={styles.desc}>잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
      <div className={styles.footer}>
        <Button onClick={reset}>다시 시도하기</Button>
        <Button
          onClick={() => {
            if (window.history.length > 1) router.back()
            else router.push('/')
          }}
        >
          이전 페이지로 이동하기
        </Button>
      </div>
    </main>
  )
}
