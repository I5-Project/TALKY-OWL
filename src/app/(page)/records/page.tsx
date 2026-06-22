import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import SetHeader from '@/components/layout/SetHeader'
import RecordListSection from '@/components/records/RecordListSection'
import styles from './page.module.scss'

export default async function RecordsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className={styles.page}>
      <SetHeader variant="logo" />
      <RecordListSection />
    </div>
  )
}
