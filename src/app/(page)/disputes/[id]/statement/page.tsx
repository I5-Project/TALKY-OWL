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

const CATEGORIES: CategoryGroup[] = ['romance', 'work', 'friend', 'family']

const MBTI_OPTIONS = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
].map((v) => ({ value: v, label: v }))

export default function StatementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()

  const [category, setCategory] = React.useState<CategoryGroup>('romance')
  const [mbti, setMbti] = React.useState('')
  const [content, setContent] = React.useState('')

  const handleSave = () => {
    // TODO: API 연결 — 진술 저장 후 사건 상세 페이지로 이동
    router.push(`/disputes/${id}`)
  }

  return (
    <div className={styles.page}>
      <Header title="사건작성" onBack={() => router.back()} />

      <div className={styles.content}>
        {/* 사건 카테고리 */}
        <section className={styles.section}>
          <p className={styles.label}>사건 카테고리</p>
          <div className={styles.categories}>
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICON_MAP[cat]
              const isSelected = category === cat
              return (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.categoryItem} ${isSelected ? styles['categoryItem--selected'] : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  <div className={`${styles.categoryIcon} ${isSelected ? styles['categoryIcon--selected'] : ''}`}>
                    <Icon sx={{ fontSize: 20 }} />
                  </div>
                  <span className={`${styles.categoryLabel} ${isSelected ? styles['categoryLabel--selected'] : ''}`}>
                    {CATEGORY_LABEL_MAP[cat]}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* 진술서 */}
        <section className={styles.section}>
          <p className={styles.label}>작성자님의 진술서</p>
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
            placeholder="사건내용을 작성해주세요 욕설의 경우 가리기 처리 될 수 있어요"
            className={styles.textarea}
          />
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
