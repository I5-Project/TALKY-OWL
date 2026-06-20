'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import CategoryFilter, { type Category } from '@/components/ui/CategoryFilter'
import CaseCard from '@/components/ui/CaseCard'
import Avatar from '@/components/ui/Avatar'
import StatusBadge from '@/components/ui/StatusBadge'
import Spinner from '@/components/ui/Spinner'
import { useCompletedCases } from '@/domains/dispute/dispute.hooks'
import type { CategoryGroup } from '@/types/common'
import styles from './RecordListSection.module.scss'

function formatDate(dateStr: string): string {
  return dateStr.slice(2, 10)
}

export default function RecordListSection() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all')

  const categoryGroup = selectedCategory === 'all' ? undefined : selectedCategory as CategoryGroup
  const { data: records = [], isLoading, isError } = useCompletedCases(categoryGroup)

  return (
    <section className={styles.section}>
      <div className={styles.filterWrapper}>
        <CategoryFilter value={selectedCategory} onChange={setSelectedCategory} />
      </div>

      {isLoading ? (
        <div className={styles.center}>
          <Spinner />
        </div>
      ) : isError ? (
        <p className={styles.empty}>사건 기록을 불러오지 못했어요.</p>
      ) : records.length === 0 ? (
        <div className={styles.empty}>
          <Image src="/images/characters/character-case.png" alt="" width={120} height={120} />
          <p className={styles.emptyText}>등록한 사건이 없어요</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {records.map((record) => {
            const profileImageUrl = record.participants[0]?.profileImageUrl ?? undefined
            return (
              <li key={record.id}>
                <Link href={`/disputes/${record.id}`} className={styles.cardWrapper}>
                  <CaseCard
                    title={record.title}
                    preview={record.description ?? ''}
                    date={formatDate(record.createdAt)}
                    categoryGroup={record.categoryGroup}
                  />
                  <div className={styles.cardFooter}>
                    <div className={styles.cardFooterLeft}>
                      <Avatar src={profileImageUrl} alt="참여자" size="s" />
                      <time className={styles.cardDate}>{formatDate(record.createdAt)}</time>
                    </div>
                    <StatusBadge status={record.status} />
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
