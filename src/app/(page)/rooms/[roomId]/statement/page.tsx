'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useHeaderStore } from '@/stores/headerStore'
import { useUserMe } from '@/domains/user/hooks'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
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

const AI_ERROR_CODES = ['AI_EXTRACTION_FAILED', 'AI_EXTRACTION_TIMEOUT', 'AI_EXTRACTION_PARSE_ERROR']

export default function NewStatementPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const { roomId } = React.use(params)
  const { category: rawCategory } = React.use(searchParams)
  const router = useRouter()
  const setHeader = useHeaderStore((s) => s.setHeader)
  const { data: userMe } = useUserMe()

  React.useEffect(() => {
    setHeader({ variant: 'title', title: '사건작성', onBack: () => router.back() })
    return () => setHeader(null)
  }, [])

  const category: CategoryGroup = VALID_CATEGORIES.includes(rawCategory as CategoryGroup)
    ? (rawCategory as CategoryGroup)
    : 'romance'

  const [mbti, setMbti] = React.useState('')
  const [content, setContent] = React.useState('')
  const SAVING_MESSAGES = [
    '나쁜 말을 검열 중입니다',
    '내용을 저장 중입니다',
    'AI가 분석 중입니다',
    '조금만 기다려주세요',
  ]

  const [isLoading, setIsLoading] = React.useState(false)
  const [savingMsgIdx, setSavingMsgIdx] = React.useState(0)
  const [filterMessage, setFilterMessage] = React.useState<string | null>(null)
  const [showPersonalInfoWarning, setShowPersonalInfoWarning] = React.useState(false)
  const [savedDisputeId, setSavedDisputeId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!userMe) return
    setMbti(userMe.mbti ?? '')
  }, [userMe])

  React.useEffect(() => {
    if (!isLoading) return
    const timer = setInterval(() => {
      setSavingMsgIdx((i) => (i + 1) % SAVING_MESSAGES.length)
    }, 2000)
    return () => clearInterval(timer)
  }, [isLoading])

  const handleCancel = () => {
    fetch(`/api/rooms/${roomId}`, { method: 'DELETE', keepalive: true }).catch(() => {})
    router.push('/')
  }

  const handleSave = async () => {
    if (isLoading) return
    setIsLoading(true)
    setFilterMessage(null)

    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, categoryGroup: category, content }),
      })
      const json = await res.json() as {
        success: boolean
        data?: { id: string; hasPersonalInfo?: boolean }
        error?: { code?: string; message?: string }
      }

      if (!json.success) {
        setIsLoading(false)
        if (json.error?.code && AI_ERROR_CODES.includes(json.error.code)) {
          alert(json.error.message ?? 'AI 분석에 실패했습니다. 다시 시도해주세요.')
          return
        }
        setFilterMessage(json.error?.message ?? '저장 중 오류가 발생했습니다. 다시 시도해주세요.')
        return
      }

      if (json.data?.hasPersonalInfo) {
        setSavedDisputeId(json.data.id)
        setIsLoading(false)
        setShowPersonalInfoWarning(true)
        return
      }

      router.push(`/disputes/${json.data!.id}`)
    } catch {
      setIsLoading(false)
      setFilterMessage('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  const Icon = CATEGORY_ICON_MAP[category]

  if (isLoading) {
    return (
      <div className={styles.savingScreen}>
        <div className={styles.savingContent}>
          <Spinner />
          <p className={styles.savingText}>{SAVING_MESSAGES[savingMsgIdx]}</p>
        </div>
      </div>
    )
  }

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
        <div className={styles.footerRow}>
          <Button variant="outline" onClick={() => void handleCancel()} disabled={isLoading}>
            취소
          </Button>
          <Button onClick={() => void handleSave()} disabled={!content.trim() || isLoading}>
            진술저장
          </Button>
        </div>
      </div>

      {showPersonalInfoWarning && savedDisputeId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <p className={styles.modalText}>개인정보가 포함된 것 같아요</p>
            <p className={styles.modalSubText}>
              전화번호, 주소 등 민감한 정보가 포함되어 있을 수 있어요.
              진술 내용을 다시 확인해주세요.
            </p>
            <div className={styles.modalActions}>
              <Button onClick={() => router.push(`/disputes/${savedDisputeId}`)}>
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
