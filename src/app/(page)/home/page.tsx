import Image from 'next/image'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Header from '@/components/layout/Header'
import StatsCategorySection from '@/components/home/StatsCategorySection'
import styles from './page.module.scss'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  // TODO: [개발 완료 후 반드시 제거] 개발 편의를 위해 로그인 상태 강제 설정
  // 실제 배포 전 아래 줄을 삭제하고 const isLoggedIn = !!session 으로 교체할 것
  const isLoggedIn = true
  const userName = session?.user?.name ?? '테스트유저'

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
        {/* 인사 */}
        <section className={styles.greeting}>
          <p className={styles.userName}>{isLoggedIn ? `${userName}님` : '안녕하세요'}</p>
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

        {/* 고민 카테고리 TOP4 */}
        <StatsCategorySection />

        {/* 구분선 */}
        <div className={styles.divider} />

        {/* 진행중인 사건(로그인) or 말해부엉 알아보기(비로그인) */}
        {!isLoggedIn && (
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
