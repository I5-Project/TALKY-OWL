'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { CATEGORY_ICON_MAP, CATEGORY_LABEL_MAP } from '@/components/ui/CategoryIcon'
import type { CategoryGroup } from '@/types/common'
import styles from './StatementPage.module.scss'

const VALID_CATEGORIES: CategoryGroup[] = ['romance', 'work', 'friend', 'family']

const MBTI_OPTIONS = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
].map((v) => ({ value: v, label: v }))

export default function StatementPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const { id } = React.use(params)
  const { category: rawCategory } = React.use(searchParams)
  const router = useRouter()

  // TODO: 이전 페이지 카테고리 데이터 연동 후 null 처리로 교체
  const category: CategoryGroup = VALID_CATEGORIES.includes(rawCategory as CategoryGroup)
    ? (rawCategory as CategoryGroup)
    : 'romance'

  const [mbti, setMbti] = React.useState('')
  const [content, setContent] = React.useState('')

  const handleSave = () => {
    // TODO: API 연결 — 진술 저장 후 사건 상세 페이지로 이동
    router.push(`/disputes/${id}`)
  }

  if (!category) {
    return (
      <div className={styles.page}>
        <Header title="사건작성" onBack={() => router.back()} />
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <p className={styles.modalText}>카테고리를 선택해주세요</p>
            <Button onClick={() => router.back()}>확인</Button>
          </div>
        </div>
      </div>
    )
  }

  const Icon = CATEGORY_ICON_MAP[category]

  return (
    <div className={styles.page}>
      <Header title="사건작성" onBack={() => router.back()} />

      <div className={styles.content}>
        {/* 사건 카테고리 — 이전 페이지에서 선택된 카테고리만 표시 */}
        <section className={styles.section}>
          <p className={styles.label}>사건 카테고리</p>
          <div className={styles.categories}>
            <div className={styles.categoryItem}>
              <div className={styles.categoryIcon}>
                <Icon sx={{ fontSize: 20 }} />
              </div>
              <span className={styles.categoryLabel}>
                {CATEGORY_LABEL_MAP[category]}
              </span>
            </div>
          </div>
        </section>

        {/* 진술서 */}
        <section className={styles.section}>
          <p className={styles.label}>작성자님의 진술서</p>
          <div className={styles.statementGroup}>
            <Select
              value={mbti}
              onChange={(e) => setMbti(e.target.value)}
              options={MBTI_OPTIONS}
              placeholder="작성자님의 MBTI 선택 해주세요"
            />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
              placeholder={"사건내용을 작성해주세요.\n욕설의 경우 가리기 처리 될 수 있어요"}
              className={styles.textarea}
            />
          </div>
        </section>
      </div>

      <div className={styles.footer}>
        <Button onClick={handleSave} disabled={!content.trim()}>
          진술저장
        </Button>
      </div>
    </div>
  )
}
