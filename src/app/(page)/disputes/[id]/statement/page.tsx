'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useHeaderStore } from '@/stores/headerStore'
import { useDispute } from '@/domains/dispute/dispute.hooks'
import { useUserMe } from '@/domains/user/hooks'
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
  searchParams: Promise<{ category?: string; edit?: string }>
}) {
  const { id } = React.use(params)
  const { category: rawCategory, edit } = React.use(searchParams)
  const isEditMode = edit === 'true'
  const router = useRouter()
  const setHeader = useHeaderStore((s) => s.setHeader)

  const { data: dispute } = useDispute(isEditMode ? id : '')
  const { data: userMe } = useUserMe()

  React.useEffect(() => {
    setHeader({ variant: 'title', title: isEditMode ? '사건수정' : '사건작성', onBack: () => router.back() })
    return () => setHeader(null)
  }, [isEditMode])

  const category: CategoryGroup = VALID_CATEGORIES.includes(rawCategory as CategoryGroup)
    ? (rawCategory as CategoryGroup)
    : 'romance'

  const [mbti, setMbti] = React.useState('')
  const [content, setContent] = React.useState('')

  React.useEffect(() => {
    if (!isEditMode || !dispute || !userMe) return
    const existing = dispute.statements?.find((s) => s.userId === userMe.id)
    if (existing) setContent(existing.content)
  }, [isEditMode, dispute, userMe])
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
      const json = await res.json() as { success: boolean; data?: { hasPersonalInfo?: boolean }; error?: { code?: string; message?: string } }

      if (!json.success) {
        setIsLoading(false)
        const AI_EXTRACTION_CODES = ['AI_EXTRACTION_FAILED', 'AI_EXTRACTION_TIMEOUT', 'AI_EXTRACTION_PARSE_ERROR']
        if (json.error?.code && AI_EXTRACTION_CODES.includes(json.error.code)) {
          alert(json.error.message ?? 'AI 분석에 실패했습니다. 다시 시도해주세요.')
          return
        }
        setFilterMessage(json.error?.message ?? '저장 중 오류가 발생했습니다. 다시 시도해주세요.')
        return
      }

      if (json.data?.hasPersonalInfo) {
        setIsLoading(false)
        setShowPersonalInfoWarning(true)
        return
      }

      // 성공 시 isLoading을 false로 바꾸지 않음 — 페이지가 unmount될 때까지 스피너 유지
      router.push(`/disputes/${id}`)
    } catch {
      setIsLoading(false)
      setFilterMessage('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  if (!category) {
    return (
      <div className={styles.page}>
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
          {isLoading ? '저장 중...' : isEditMode ? '수정저장' : '진술저장'}
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
