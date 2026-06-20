'use client'

import { useState } from 'react'
import Image from 'next/image'
import CategoryFilter, { type Category } from '@/components/ui/CategoryFilter'
import CaseRecordCard from '@/components/ui/CaseRecordCard'
import Spinner from '@/components/ui/Spinner'
import { useCompletedCases } from '@/domains/dispute/dispute.hooks'
import type { CategoryGroup } from '@/types/common'
import styles from './RecordListSection.module.scss'

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
          {records.map((record) => (
            <li key={record.id}>
              <CaseRecordCard
                href={`/disputes/${record.id}`}
                title={record.title}
                description={record.description}
                categoryGroup={record.categoryGroup}
                status={record.status}
                createdAt={record.createdAt}
                participants={record.participants}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
