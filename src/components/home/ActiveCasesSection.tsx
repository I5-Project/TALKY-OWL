'use client'

import Image from 'next/image'
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
  const { data: cases = [], isLoading, isError } = useActiveCases()

  if (isLoading) return null

  if (isError) return (
    <section className={styles.section}>
      <h2 className={styles.title}>진행중인 사건</h2>
      <p className={styles.empty}>사건 목록을 불러올 수 없어요</p>
    </section>
  )

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>진행중인 사건</h2>

      {cases.length === 0 ? (
        <div className={styles.emptyState}>
          <Image
            src="/images/characters/character-case.png"
            alt=""
            width={80}
            height={80}
            className={styles.emptyImage}
            priority
          />
          <p className={styles.empty}>아직 진행중인 사건이 없어요</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {cases.map((item) => (
            <li
              key={item.id}
              className={styles.cardWrapper}
              onClick={() => router.push(`/disputes/${item.id}`)}
            >
              <CaseCard
                title={item.title}
                preview={item.description ?? ''}
                date=""
                categoryGroup={item.categoryGroup}
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
