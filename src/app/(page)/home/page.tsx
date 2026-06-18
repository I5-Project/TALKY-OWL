import Image from 'next/image'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Header from '@/components/layout/Header'
import styles from './page.module.scss'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const isLoggedIn = !!session
  const userName = session?.user?.name ?? '사용자'

  return (
    <div className={styles.page}>
      <Header variant="logo" />

      <Image
        src="/images/characters/character-home.png"
        alt="말해부엉 캐릭터"
        width={169}
        height={138}
        className={styles.characterImage}
      />

      <main className={styles.container}>
        {isLoggedIn ? (
          <>
            {/* 인사 */}
            <section className={styles.greeting}>
              <p className={styles.userName}>{userName}님</p>
              <p className={styles.greetingText}>오늘 감정은 어떠신가요?</p>
            </section>

            {/* 오늘의 일기 박스 */}
            <Link href="/diary/new" className={styles.diaryBox} aria-label="감정일기 작성">
              <div className={styles.diaryTextGroup}>
                <p className={styles.diaryTitle}>오늘의 일기를 적어보세요</p>
                <p className={styles.diarySubtitle}>감정일기 작성하러가기</p>
              </div>
              <span className={styles.diaryButton} aria-hidden="true">+</span>
            </Link>
          </>
        ) : (
          /* 비로그인: 말해부엉 알아보기 박스 */
          <Link href="/login" className={styles.introBox} aria-label="말해부엉 알아보기">
            <div className={styles.diaryTextGroup}>
              <p className={styles.diaryTitle}>말해부엉이 궁금하신가요?</p>
              <p className={styles.diarySubtitle}>말해부엉 알아보기</p>
            </div>
            <span className={styles.introArrow} aria-hidden="true">›</span>
          </Link>
        )}
      </main>
    </div>
  )
}
