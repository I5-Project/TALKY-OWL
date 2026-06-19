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
  const router = useRouter()

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleCategoryClick = async (category: CategoryGroup) => {
    if (isCreating) return
    setIsOpen(false)
    setIsCreating(true)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryGroup: category }),
        signal: controller.signal,
      })
      const json = await res.json()
      if (!json.success) throw new Error()
      router.push(`/disputes/new/statement?category=${category}&roomId=${json.data.id}`)
    } catch {
      router.push(`/disputes/new/statement?category=${category}`)
    } finally {
      clearTimeout(timeout)
      setIsCreating(false)
    }
  }

  return (
    <>
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
