'use client'

import styles from './NewCaseButton.module.scss'

// TODO: 새 사건 작성 페이지(/rooms/new 또는 해당 라우트) 생성 후 href를 실제 경로로 교체할 것
const NEW_CASE_HREF = '#'

export default function NewCaseButton() {
  return (
    <a href={NEW_CASE_HREF} className={styles.button} aria-label="새 사건 작성">
      새 사건 +
    </a>
  )
}
