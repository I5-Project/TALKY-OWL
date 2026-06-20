'use client'

import Image from 'next/image'
import type { AiJudgmentDto } from '@/types/judgment'
import type { DisputeParticipantDto } from '@/types/dispute'
import styles from './JudgmentResult.module.scss'

interface Props {
  judgment: AiJudgmentDto
  participants: DisputeParticipantDto[]
}

function Avatar({ src }: { src: string | null }) {
  return (
    <div className={styles.avatar}>
      {src
        ? <Image src={src} alt="" width={0} height={0} sizes="100vw" className={styles.avatarImg} />
        : <div className={styles.avatarFallback} />
      }
    </div>
  )
}

export default function JudgmentResult({ judgment, participants }: Props) {
  const isSolo = participants.length === 1
  const participantA = participants.find((p) => p.role === 'role_a')
  const participantB = participants.find((p) => p.role === 'role_b')

  const showReconcile = !!judgment.aSuggestedLine || (!isSolo && !!judgment.bSuggestedLine)

  return (
    <div className={styles.container}>

      {/* ── 판결결과 ── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>판결결과</h3>

        <div className={styles.cards}>
          {judgment.aFault && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <Avatar src={participantA?.profileImageUrl ?? null} />
                <span className={styles.cardLabel}>{participantA?.nickname ?? 'A'}님의 잘못</span>
              </div>
              <p className={styles.cardContent}>{judgment.aFault}</p>
            </div>
          )}

          {/* B의 잘못은 2인 판결에서만 노출 */}
          {!isSolo && judgment.bFault && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <Avatar src={participantB?.profileImageUrl ?? null} />
                <span className={styles.cardLabel}>{participantB?.nickname ?? 'B'}님의 잘못</span>
              </div>
              <p className={styles.cardContent}>{judgment.bFault}</p>
            </div>
          )}
        </div>

        <p className={styles.aiNotice}>AI의 답변결과이니 참고용으로만 봐주세요</p>
      </section>

      {/* ── 화해 제안 ── */}
      {showReconcile && (
        <section className={styles.reconcileSection}>
          <h3 className={styles.sectionTitle}>이렇게 사과해보면 어떨까요?</h3>
          {/* 선물 아이콘: 제목 우측 상단 고정, 아래 카드와 살짝 겹침 */}
          <Image
            src="/images/characters/character-gift.png"
            alt=""
            width={52}
            height={52}
            className={styles.reconcileIcon}
          />

          <div className={styles.cards}>
            {judgment.aSuggestedLine && (
              <div className={styles.suggestedCard}>
                <div className={styles.cardHeader}>
                  <Avatar src={participantA?.profileImageUrl ?? null} />
                  <span className={styles.cardLabel}>{participantA?.nickname ?? 'A'}님</span>
                </div>
                <p className={styles.cardContent}>{judgment.aSuggestedLine}</p>
              </div>
            )}

            {!isSolo && judgment.bSuggestedLine && (
              <div className={styles.suggestedCard}>
                <div className={styles.cardHeader}>
                  <Avatar src={participantB?.profileImageUrl ?? null} />
                  <span className={styles.cardLabel}>{participantB?.nickname ?? 'B'}님</span>
                </div>
                <p className={styles.cardContent}>{judgment.bSuggestedLine}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

