'use client'

import { useRouter } from 'next/navigation'
import CaseCard from '@/components/ui/CaseCard'
import { CATEGORY_COLOR_MAP } from '@/components/ui/CategoryIcon'
import { useActiveCases } from '@/hooks/useActiveCases'
import styles from './ActiveCasesSection.module.scss'

function formatDate(isoString: string): string {
  return isoString.slice(2, 10)
}

export default function ActiveCasesSection() {
  const router = useRouter()
  const { data: cases = [] } = useActiveCases()

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>진행중인 사건</h2>

      {cases.length === 0 ? (
        <p className={styles.empty}>아직 진행중인 사건이 없어요</p>
      ) : (
        <ul className={styles.list}>
          {cases.map((item) => (
            <li
              key={item.id}
              className={styles.cardWrapper}
              style={{ '--accent-color': CATEGORY_COLOR_MAP[item.categoryGroup] } as React.CSSProperties}
            >
              <CaseCard
                title={item.title}
                preview={item.description ?? ''}
                date={formatDate(item.createdAt)}
                categoryGroup={item.categoryGroup}
                status="progress"
                participants={item.participants}
                onClick={() => router.push(`/disputes/${item.id}`)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
