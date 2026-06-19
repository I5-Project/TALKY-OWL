import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Header from '@/components/layout/Header'
import BottomNavigation from '@/components/layout/BottomNavigation'
import RecordListSection from '@/components/records/RecordListSection'
import styles from './page.module.scss'

export default async function RecordsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className={styles.page}>
      <Header variant="logo" />
      <RecordListSection />
      <BottomNavigation />
    </div>
  )
}
