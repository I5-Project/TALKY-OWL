'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { CATEGORY_ICON_MAP, CATEGORY_LABEL_MAP } from '@/components/ui/CategoryIcon'
import { useDispute } from '@/domains/dispute/dispute.hooks'
import Spinner from '@/components/ui/Spinner'
import styles from './StatementPage.module.scss'

const MBTI_OPTIONS = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
].map((v) => ({ value: v, label: v }))

export default function StatementPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const router = useRouter()

  const { data: dispute, isLoading } = useDispute(id)
  const category = dispute?.categoryGroup ?? null

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
      const json = await res.json()

      if (!json.success) {
        if (json.error?.code === 'CONTENT_BLOCKED') {
          setFilterMessage(json.error.message)
        } else {
          setFilterMessage('저장 중 오류가 발생했습니다. 다시 시도해주세요.')
        }
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

  if (isLoading) return <Spinner />

  if (!dispute || !category) {
    return (
      <div className={styles.page}>
        <Header title="사건작성" onBack={() => router.back()} />
        <p className={styles.empty}>사건을 찾을 수 없습니다.</p>
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
