import Image from 'next/image'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Header from '@/components/layout/Header'
import styles from './page.module.scss'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const userName = session?.user?.name ?? '사용자'

  return (
    <>
      <Header variant="logo" />

      <main className={styles.container}>
        {/* 헤더: 인사 + 부엉이 */}
        <section className={styles.header}>
          <div className={styles.greeting}>
            <p className={styles.userName}>{userName}님</p>
            <p className={styles.greetingText}>오늘 감정은 어떠신가요?</p>
          </div>
          <Image
            src="/images/characters/character-welcome.png"
            alt="말해부엉 캐릭터"
            width={80}
            height={80}
            className={styles.owlImage}
          />
        </section>

        {/* 오늘의 일기 박스 */}
        {/* 승규님 우선 버튼 클릭시 diary/new로 작성페이지를 임시로 지정해놨는데 작성페이지 이름 어떻게 하실건지 알려주시면 수정하겠습니다 */}
        <Link href="/diary/new" className={styles.diaryBox} aria-label="감정일기 작성">
          <div className={styles.diaryTextGroup}>
            <p className={styles.diaryTitle}>오늘의 일기를 적어보세요</p>
            <p className={styles.diarySubtitle}>감정일기 작성하러가기</p>
          </div>
          <span className={styles.diaryButton} aria-hidden="true">+</span>
        </Link>
      </main>
    </>
  )
}
