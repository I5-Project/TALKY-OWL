'use client'

import { useRouter } from 'next/navigation'
import CaseCard from '@/components/ui/CaseCard'
import Avatar, { AvatarGroup } from '@/components/ui/Avatar'
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
            >
              <CaseCard
                title={item.title}
                preview={item.description ?? ''}
                date=""
                categoryGroup={item.categoryGroup}
                onClick={() => router.push(`/disputes/${item.id}`)}
              />
              <div className={styles.cardFooter}>
                <AvatarGroup size="s" max={2}>
                  {item.participants.map((p) => (
                    <Avatar
                      key={p.role}
                      src={p.user.profileImageUrl ?? undefined}
                      alt={p.user.nickname ?? '참여자'}
                      size="s"
                    />
                  ))}
                </AvatarGroup>
                <time className={styles.cardDate}>{formatDate(item.createdAt)}</time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
