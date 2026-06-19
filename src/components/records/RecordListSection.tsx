'use client'

import { useState } from 'react'
import Link from 'next/link'
import CategoryFilter, { type Category } from '@/components/ui/CategoryFilter'
import CaseCard from '@/components/ui/CaseCard'
import Avatar from '@/components/ui/Avatar'
import StatusBadge, { type DisputeStatus } from '@/components/ui/StatusBadge'
import type { CategoryGroup } from '@/types/common'
import styles from './RecordListSection.module.scss'

interface RecordItem {
  id: string
  disputeId: string
  title: string
  description: string
  categoryGroup: CategoryGroup
  disputeStatus: DisputeStatus
  createdAt: string
  profileImageUrl?: string
}

// TODO: API 연동 시 교체
const DUMMY_RECORDS: RecordItem[] = [
  {
    id: '1',
    disputeId: 'dispute-1',
    title: '술주정 사건',
    description: '제보자 술을 아주 극혐하는데 남친은 술을 너무 좋아해서 벌어진 사건',
    categoryGroup: 'romance',
    disputeStatus: 'judged',
    createdAt: '2026-06-13',
  },
  {
    id: '2',
    disputeId: 'dispute-2',
    title: '업무 분배 갈등 사건',
    description: '팀장이 특정 팀원에게만 업무를 몰아줘서 발생한 직장 내 갈등 사건',
    categoryGroup: 'work',
    disputeStatus: 'judged',
    createdAt: '2026-06-10',
  },
  {
    id: '3',
    disputeId: 'dispute-3',
    title: '용돈 갈등 사건',
    description: '부모님이 형에게만 용돈을 더 많이 주는 것 같아서 억울한 마음이 든 사건',
    categoryGroup: 'family',
    disputeStatus: 'closed',
    createdAt: '2026-06-05',
  },
  {
    id: '4',
    disputeId: 'dispute-4',
    title: '약속 파기 사건',
    description: '친구가 중요한 약속을 갑자기 취소하고 연락도 잘 안 되어 상처받은 사건',
    categoryGroup: 'friend',
    disputeStatus: 'judged',
    createdAt: '2026-05-28',
  },
]

function formatDate(dateStr: string): string {
  return dateStr.slice(2, 10)
}

export default function RecordListSection() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all')

  const filtered = selectedCategory === 'all'
    ? DUMMY_RECORDS
    : DUMMY_RECORDS.filter((r) => r.categoryGroup === selectedCategory)

  return (
    <section className={styles.section}>
      <div className={styles.filterWrapper}>
        <CategoryFilter value={selectedCategory} onChange={setSelectedCategory} />
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>진행완료된 사건이 없어요</p>
      ) : (
        <ul className={styles.list}>
          {filtered.map((record) => (
            <li key={record.id}>
              <Link
                href={`/disputes/${record.disputeId}`}
                className={styles.cardWrapper}
              >
                <CaseCard
                  title={record.title}
                  preview={record.description}
                  date={formatDate(record.createdAt)}
                  categoryGroup={record.categoryGroup}
                />
                <div className={styles.cardFooter}>
                  <div className={styles.cardFooterLeft}>
                    <Avatar src={record.profileImageUrl} alt="참여자" size="s" />
                    <time className={styles.cardDate}>{formatDate(record.createdAt)}</time>
                  </div>
                  <StatusBadge status={record.disputeStatus} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
