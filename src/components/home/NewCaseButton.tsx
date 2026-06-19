'use client'

import { useState, useEffect } from 'react'
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

// TODO: 새 사건 작성 페이지(/rooms/new 등) 생성 후 카테고리별 실제 경로로 교체
// 현재는 페이지가 없어 '#'으로 임시 처리
function getCategoryHref(_category: CategoryGroup): string {
  return '#'
}

export default function NewCaseButton() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

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
                <a key={category} href={getCategoryHref(category)} className={styles.item}>
                  <CategoryIcon category={category} />
                  <span className={styles.itemLabel}>{label}</span>
                </a>
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
