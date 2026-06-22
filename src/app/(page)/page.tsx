import Image from 'next/image'
import Link from 'next/link'
import { getCachedSession } from '@/lib/auth/getSession'
import SetHeader from '@/components/layout/SetHeader'
import StatsCategorySection from '@/components/home/StatsCategorySection'
import ActiveCasesSection from '@/components/home/ActiveCasesSection'
import NewCaseButton from '@/components/home/NewCaseButton'
import HomeServiceInfo from '@/components/home/HomeServiceInfo'
import HomeGreeting from '@/components/home/HomeGreeting'
import styles from '../page.module.scss'

export default async function HomePage() {
  const session = await getCachedSession()
  const isLoggedIn = !!session

  return (
    <div className={styles.page}>
      <SetHeader variant="logo" transparent />

      <Image
        src="/images/characters/character-home.svg"
        alt="말해부엉 캐릭터"
        width={169}
        height={138}
        className={styles.characterImage}
      />

      <div className={styles.container}>
        {/* 인사 */}
        <HomeGreeting />

        {/* 오늘의 일기 박스 */}
        <Link href="/diary/new" className={styles.diaryBox} aria-label="감정일기 작성">
          <div className={styles.diaryTextGroup}>
            <p className={styles.diaryTitle}>오늘의 일기를 적어보세요</p>
            <p className={styles.diarySubtitle}>감정일기 작성하러가기</p>
          </div>
          <span className={styles.diaryButton} aria-hidden="true">
            +
          </span>
        </Link>

        {/* 고민 카테고리 TOP4 */}
        <StatsCategorySection />

        {/* 구분선 */}
        <div className={styles.divider} />

        {/* 진행중인 사건(로그인) or 말해부엉 알아보기(비로그인) */}
        {isLoggedIn ? (
          <div className={styles.activeCasesSection}>
            <ActiveCasesSection />
          </div>
        ) : (
          <Link href="/login" className={styles.introBox} aria-label="말해부엉 알아보기">
            <div className={styles.diaryTextGroup}>
              <p className={styles.diaryTitle}>말해부엉이 궁금하신가요?</p>
              <p className={styles.diarySubtitle}>말해부엉 알아보기</p>
            </div>
            <span className={styles.introArrow} aria-hidden="true">
              ›
            </span>
          </Link>
        )}
      </div>

      {/* 서비스 정보 푸터 — 스크롤 시 탭바 바로 위에 sticky */}
      <div className={styles.serviceInfoWrapper}>
        <HomeServiceInfo />
      </div>

      {isLoggedIn && <NewCaseButton />}
    </div>
  )
}
