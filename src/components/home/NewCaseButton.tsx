'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CloseIcon from '@mui/icons-material/Close'
import CategoryIcon from '@/components/ui/CategoryIcon'
import type { CategoryGroup } from '@/types/common'
import styles from './NewCaseButton.module.scss'

const CATEGORY_ITEMS: { category: CategoryGroup; label: string }[] = [
  { category: 'romance', label: '연인관계' },
  { category: 'work',    label: '직장관계' },
  { category: 'friend',  label: '친구관계' },
  { category: 'family',  label: '가족관계' },
]

export default function NewCaseButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [limitError, setLimitError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    document.body.style.overflow = (isOpen || !!limitError || !!errorMessage) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen, limitError, errorMessage])

  const handleCategoryClick = async (category: CategoryGroup) => {
    if (isCreating) return
    setIsOpen(false)
    setIsCreating(true)
    setErrorMessage(null)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)
    try {
      const roomRes = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryGroup: category }),
        signal: controller.signal,
      })
      const roomJson = await roomRes.json() as { success: boolean; data?: { id: string }; error?: { code?: string; message?: string } }
      if (!roomJson.success || !roomJson.data) {
        if (roomJson.error?.code === 'CATEGORY_LIMIT_EXCEEDED') {
          setIsOpen(false)
          setLimitError(roomJson.error.message ?? '사건은 카테고리당 2개까지만\n생성이 가능합니다.')
          return
        }
        throw new Error(roomJson.error?.message)
      }

      router.push(`/rooms/${roomJson.data.id}/statement?category=${category}`)
    } catch (err) {
      setErrorMessage(err instanceof Error && err.message ? err.message : '방 생성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      clearTimeout(timeout)
      setIsCreating(false)
    }
  }

  return (
    <>
      {limitError && (
        <div
          className={styles.alertOverlay}
          onClick={() => setLimitError(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.alertModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.alertMessage}>{limitError}</p>
            <button className={styles.alertCloseButton} onClick={() => setLimitError(null)}>
              확인
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          className={styles.alertOverlay}
          onClick={() => setErrorMessage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.alertModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.alertMessage}>{errorMessage}</p>
            <button className={styles.alertCloseButton} onClick={() => setErrorMessage(null)}>
              확인
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.categoryBox}>
              {CATEGORY_ITEMS.map(({ category, label }) => (
                <button key={category} className={styles.item} onClick={() => handleCategoryClick(category)} disabled={isCreating}>
                  <CategoryIcon category={category} />
                  <span className={styles.itemLabel}>{label}</span>
                </button>
              ))}
            </div>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="카테고리 선택 닫기"
            >
              <CloseIcon style={{ width: 24, height: 24 }} />
            </button>
          </div>
        </div>
      )}
      {!isOpen && (
        <button
          className={styles.button}
          onClick={() => setIsOpen(true)}
          aria-label="새 사건 작성"
        >
          새 사건 +
        </button>
      )}
    </>
  )
}
