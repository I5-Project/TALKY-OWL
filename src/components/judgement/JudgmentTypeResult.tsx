'use client'

import Image from 'next/image'
import { useSession } from 'next-auth/react'
import ActionPrompt from '@/components/ui/ActionPrompt'
import { useToastStore } from '@/stores/toastStore'
import { getSessionUserId } from '@/lib/auth/session'
import type { AiJudgmentDto } from '@/types/judgment'
import type { DisputeParticipantDto } from '@/types/dispute'
import styles from './JudgmentTypeResult.module.scss'

interface Props {
  judgment: AiJudgmentDto
  participants: DisputeParticipantDto[]
  disputeId: string
}

export default function JudgmentTypeResult({ judgment, participants, disputeId }: Props) {
  const showToast = useToastStore((s) => s.show)
  const { data: session } = useSession()

  const currentUserId = getSessionUserId(session)
  const viewer = participants.find((p) => p.userId === currentUserId)
  const viewerLabel = viewer?.name ?? ''

  const { cardImageUrl, displayName } = judgment.resultConflictDetail

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/disputes/${disputeId}/type`
    const isMobile = typeof navigator.share === 'function'

    if (isMobile) {
      try {
        await navigator.share({
          title: `${viewerLabel}님의 갈등 유형은 '${displayName}'`,
          text: '나의 갈등 유형을 확인해봐요!',
          url: shareUrl,
        })
      } catch {
        // 공유 취소 시 무시
      }
      return
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      showToast('링크가 복사되었어요.')
    } catch {
      showToast('링크 복사에 실패했어요.')
    }
  }

  const handleDownload = async () => {
    if (!cardImageUrl) {
      showToast('저장할 이미지가 없어요.')
      return
    }
    try {
      const res = await fetch(cardImageUrl)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = `갈등유형_${displayName}.jpg`
      a.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      window.open(cardImageUrl, '_blank')
    }
  }

  return (
    <div className={styles.container}>
      <p className={styles.title}>{viewerLabel ? `${viewerLabel}님의 유형은?` : '나의 유형은?'}</p>

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
