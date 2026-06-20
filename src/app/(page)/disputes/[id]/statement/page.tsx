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

  const category: CategoryGroup = VALID_CATEGORIES.includes(rawCategory as CategoryGroup)
    ? (rawCategory as CategoryGroup)
    : 'romance'

  const [mbti, setMbti] = React.useState('')
  const [content, setContent] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [filterMessage, setFilterMessage] = React.useState<string | null>(null)
  const [showPersonalInfoWarning, setShowPersonalInfoWarning] = React.useState(false)

  const handleSave = async () => {
    if (isLoading) return
    setIsLoading(true)
    setFilterMessage(null)

    try {
      const res = await fetch(`/api/disputes/${id}/statements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const json = await res.json() as { success: boolean; data?: { hasPersonalInfo?: boolean }; error?: { message?: string } }

      if (!json.success) {
        setFilterMessage(json.error?.message ?? '저장 중 오류가 발생했습니다. 다시 시도해주세요.')
        return
      }

      if (json.data?.hasPersonalInfo) {
        setShowPersonalInfoWarning(true)
        return
      }

      router.push(`/disputes/${id}`)
    } catch {
      setFilterMessage('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
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
              onChange={(e) => { setContent(e.target.value); setFilterMessage(null) }}
              maxLength={1000}
              placeholder={"사건내용을 작성해주세요.\n욕설의 경우 가리기 처리 될 수 있어요"}
              className={styles.textarea}
              filterMessage={filterMessage ?? undefined}
            />
          </div>
        </section>
      </div>

      <div className={styles.footer}>
        <Button onClick={handleSave} disabled={!content.trim() || isLoading}>
          {isLoading ? '저장 중...' : '진술저장'}
        </Button>
      </div>

      {showPersonalInfoWarning && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <p className={styles.modalText}>개인정보가 포함된 것 같아요</p>
            <p className={styles.modalSubText}>
              전화번호, 주소 등 민감한 정보가 포함되어 있을 수 있어요.
              진술 내용을 다시 확인해주세요.
            </p>
            <div className={styles.modalActions}>
              <Button onClick={() => router.push(`/disputes/${id}`)}>
                계속 진행
              </Button>
              <Button variant="outline" onClick={() => setShowPersonalInfoWarning(false)}>
                돌아가서 수정
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
