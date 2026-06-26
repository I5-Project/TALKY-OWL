'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import ActionPrompt from '@/components/ui/ActionPrompt'
import Button from '@/components/ui/Button'
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
  const [isAppleDevice, setIsAppleDevice] = useState(false)

  useEffect(() => {
    setIsAppleDevice(/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent))
  }, [])

  const currentUserId = getSessionUserId(session)
  const viewer = participants.find((p) => p.userId === currentUserId)
  const viewerLabel = viewer?.name ?? ''

  const { cardImageUrl, displayName } = judgment.resultConflictDetail

  // Apple 기기: 공유 시트에서 저장 + 공유 통합
  const handleAppleShareSave = async () => {
    if (!cardImageUrl) {
      showToast('저장할 이미지가 없어요.')
      return
    }

    const shareUrl = `${window.location.origin}/disputes/${disputeId}/type`

    try {
      const proxyUrl = `/api/download?url=${encodeURIComponent(cardImageUrl)}`
      const res = await fetch(proxyUrl)
      if (!res.ok) throw new Error(`fetch failed: ${res.status}`)
      const blob = await res.blob()
      const file = new File([blob], 'talkyowl-conflict-type.jpg', { type: 'image/jpeg' })
      await navigator.share({
        title: `${viewerLabel}님의 갈등 유형은 '${displayName}'`,
        text: '나의 갈등 유형을 확인해봐요!',
        url: shareUrl,
        files: [file],
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      window.open(cardImageUrl, '_blank')
    }
  }

  // 비Apple 기기: 767px 이상 → 링크 복사, 미만 → navigator.share
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/disputes/${disputeId}/type`
    const isDesktop = window.innerWidth >= 767

    if (isDesktop) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        showToast('링크가 복사되었습니다!')
      } catch {
        showToast('링크 복사에 실패했어요.')
      }
      return
    }

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `${viewerLabel}님의 갈등 유형은 '${displayName}'`,
          text: '나의 갈등 유형을 확인해봐요!',
          url: shareUrl,
        })
      } catch {
        // 공유 취소 시 무시
      }
    }
  }

  // 비Apple 기기: 서버 프록시를 통한 anchor download
  const handleDownload = async () => {
    if (!cardImageUrl) {
      showToast('저장할 이미지가 없어요.')
      return
    }

    try {
      const proxyUrl = `/api/download?url=${encodeURIComponent(cardImageUrl)}`
      const res = await fetch(proxyUrl)
      if (!res.ok) throw new Error(`fetch failed: ${res.status}`)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = 'talkyowl-conflict-type.jpg'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(objectUrl), 100)
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

      {/* 액션 버튼 */}
      {isAppleDevice ? (
        <div className={styles.actions}>
          <Button variant="primary" onClick={handleAppleShareSave}>
            공유 및 저장
          </Button>
        </div>
      ) : (
        <ActionPrompt
          secondaryLabel="공유하기"
          onSecondary={handleShare}
          primaryLabel="결과 다운받기"
          onPrimary={handleDownload}
          className={styles.actions}
        />
      )}
    </div>
  )
}
