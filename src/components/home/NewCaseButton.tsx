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
  const router = useRouter()

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleCategoryClick = (category: CategoryGroup) => {
    setIsOpen(false)
    router.push(`/disputes/test/statement?category=${category}`)
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
                <button key={category} className={styles.item} onClick={() => handleCategoryClick(category)}>
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
