'use client'

import Image from 'next/image'
import ActionPrompt from '@/components/ui/ActionPrompt'
import { useDispute } from '@/domains/dispute/dispute.hooks'
import { useJudgment } from '@/domains/judgement/judgement.hooks'
import { useToastStore } from '@/stores/toastStore'
import styles from './JudgmentTypeResult.module.scss'

interface Props {
  disputeId: string
}

export default function JudgmentTypeResult({ disputeId }: Props) {
  const showToast = useToastStore((s) => s.show)
  const { data: dispute } = useDispute(disputeId)
  const { data: judgment } = useJudgment(disputeId)

  if (!judgment || !dispute) return null

  const roleA = dispute.participants.find((p) => p.role === 'role_a')
  const viewerLabel = roleA?.name ?? 'A'

  const { cardImageUrl, displayName } = judgment.resultConflictDetail

  const handleShare = () => {
    showToast('공유 기능은 준비 중이에요.')
  }

  const handleDownload = () => {
    showToast('다운로드 기능은 준비 중이에요.')
  }

  return (
    <div className={styles.container}>
      <p className={styles.title}>{viewerLabel}님의 유형은?</p>

      {/* 유형 카드 이미지 */}
      <div className={styles.cardImageWrapper}>
        {cardImageUrl ? (
          <Image
            src={cardImageUrl}
            alt={displayName}
            width={0}
            height={0}
            sizes="100vw"
            className={styles.cardImage}
          />
        ) : (
          <div className={styles.cardImageFallback}>
            <p className={styles.fallbackText}>{displayName}</p>
          </div>
        )}
      </div>

      {/* 액션 버튼 — ActionPrompt 공통 컴포넌트 사용 */}
      <ActionPrompt
        secondaryLabel="공유하기"
        onSecondary={handleShare}
        primaryLabel="결과 다운받기"
        onPrimary={handleDownload}
        className={styles.actions}
      />
    </div>
  )
}
