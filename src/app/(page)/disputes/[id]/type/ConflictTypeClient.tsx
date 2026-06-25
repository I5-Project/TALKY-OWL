'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import type { ConflictTypePublicDto } from '@/app/api/disputes/[id]/conflict-type/route'
import styles from './TypePage.module.scss'

interface Props {
  disputeId: string
  data: ConflictTypePublicDto | null
}

export default function ConflictTypeClient({ data }: Props) {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const isSessionLoading = sessionStatus === 'loading'
  const isLoggedIn = sessionStatus === 'authenticated'
  const userName = session?.user?.name

  const handleDownload = async () => {
    if (!data?.cardImageUrl) return
    try {
      const res = await fetch(data.cardImageUrl)
      if (!res.ok) throw new Error(`Image download failed: ${res.status}`)
      const blob = await res.blob()
      const fileName = `갈등유형_${data.displayName}.jpg`
      const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' })

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] })
          return
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') return
          throw error
        }
      }

      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = fileName
      a.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      window.open(data.cardImageUrl, '_blank')
    }
  }

  if (!data) {
    return (
      <div className={styles.centerWrap}>
        <p className={styles.errorText}>갈등 유형 결과를 불러올 수 없어요.</p>
        <button className={styles.backLink} onClick={() => router.back()}>이전 페이지로 돌아가기</button>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Header variant="logo" />

      <div className={styles.content}>
        <p className={styles.title}>
          {userName
            ? `${userName}님의 갈등 유형은?`
            : data.ownerName
              ? `${data.ownerName}님의 갈등 유형은?`
              : '나의 갈등 유형은?'}
        </p>

        <div className={styles.cardImageWrapper}>
          {data.cardImageUrl ? (
            <Image
              src={data.cardImageUrl}
              alt={data.displayName}
              width={0}
              height={0}
              sizes="100vw"
              className={styles.cardImage}
            />
          ) : (
            <div className={styles.cardImageFallback}>
              <p className={styles.fallbackText}>{data.displayName}</p>
            </div>
          )}
        </div>

        {data.description && <p className={styles.description}>{data.description}</p>}
      </div>

      <div className={styles.actions}>
        {!isSessionLoading && (
          isLoggedIn ? (
            <Button onClick={handleDownload}>결과 다운받기</Button>
          ) : (
            <Button onClick={() => router.push('/login')}>갈등 해결하러가기</Button>
          )
        )}
      </div>
    </div>
  )
}
