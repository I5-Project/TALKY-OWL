import { getServerSession } from 'next-auth'
// [로컬 개발] 세션 체크 활성화 시 아래 import 주석 해제 필요
// import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Header from '@/components/layout/Header'
import BottomNavigation from '@/components/layout/BottomNavigation'
import RecordListSection from '@/components/records/RecordListSection'
import styles from './page.module.scss'

export default async function RecordsPage() {
  // [로컬 개발] 카카오 OAuth 없이 테스트하기 위해 세션 체크 임시 비활성화.
  // 배포 전 _session → session 으로 변경하고 아래 redirect 코드 주석 해제 필요.
  const _session = await getServerSession(authOptions)
  // if (!_session) redirect('/login')

  return (
    <div className={styles.page}>
      <Header variant="logo" />
      <RecordListSection />
      <BottomNavigation />
    </div>
  )
}
