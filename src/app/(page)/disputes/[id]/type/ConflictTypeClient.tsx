'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Button from '@/components/ui/Button'
import type { ConflictTypePublicDto } from '@/app/api/disputes/[id]/conflict-type/route'
import styles from './TypePage.module.scss'

interface Props {
  disputeId: string
  data: ConflictTypePublicDto | null
}

export default function ConflictTypeClient({ data }: Props) {
  const router = useRouter()
  const { status: sessionStatus } = useSession()
  const isSessionLoading = sessionStatus === 'loading'
  const isLoggedIn = sessionStatus === 'authenticated'

  const handleDownload = () => {
    // TODO: 결과 다운로드 구현
  }

  if (!data) {
    return (
      <div className={styles.centerWrap}>
        <p className={styles.errorText}>갈등 유형 결과를 불러올 수 없어요.</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.logoWrap}>
        <Image src="/images/common/logo.svg" alt="TALKY OWL" width={120} height={32} />
      </div>

      <div className={styles.content}>
        <p className={styles.title}>나의 갈등 유형은?</p>

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
            <Button onClick={() => router.push('/about')}>갈등 해결하러가기</Button>
          )
        )}
      </div>
    </div>
  )
}
