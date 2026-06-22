'use client';

import Image from 'next/image';
import { useDispute } from '@/domains/dispute/dispute.hooks';
import { useJudgment } from '@/domains/judgement/judgement.hooks';
import styles from './JudgmentResult.module.scss';

interface Props {
  disputeId: string;
}

function replaceRoleNames(text: string, nameA: string, nameB: string): string {
  return text.replace(/A님|B님/g, (match) => match === 'A님' ? `${nameA}님` : `${nameB}님`)
}

function Avatar({ src }: { src: string | null }) {
  return (
    <div className={styles.avatar}>
      {src ? (
        <Image src={src} alt="" width={0} height={0} sizes="100vw" className={styles.avatarImg} />
      ) : (
        <div className={styles.avatarFallback} />
      )}
    </div>
  );
}

export default function JudgmentResult({ disputeId }: Props) {
  const { data: dispute } = useDispute(disputeId);
  const { data: judgment } = useJudgment(disputeId);

  if (!judgment || !dispute) return null;

  const { participants } = dispute;
  const isSolo = participants.length === 1;
  const participantA = participants.find((p) => p.role === 'role_a');
  const participantB = participants.find((p) => p.role === 'role_b');
  const nameA = participantA?.name ?? 'A';
  const nameB = participantB?.name ?? 'B';

  const showReconcile = !!judgment.aSuggestedLine || (!isSolo && !!judgment.bSuggestedLine);

  return (
    <div className={styles.container}>
      {/* ── 판결결과 ── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>판결결과</h3>

        {/* 점수 그래프 — 2인 판결에서만 노출 */}
        {!isSolo && (() => {
          const scoreA = Math.max(0, Number(judgment.verdictScoreA) || 0)
          const scoreB = Math.max(0, Number(judgment.verdictScoreB) || 0)
          const total = scoreA + scoreB
          const ratioA = total === 0 ? 50 : (scoreA / total) * 100
          const ratioB = total === 0 ? 50 : (scoreB / total) * 100

          const moreGuiltyParticipant =
            judgment.moreResponsibleRole === 'role_a' ? participantA
            : judgment.moreResponsibleRole === 'role_b' ? participantB
            : null

          return (
            <div className={styles.scoreGraph}>
              <div className={styles.scoreHeader}>
                <div className={styles.scoreAvatar}>
                  <Image
                    src={moreGuiltyParticipant?.profileImageUrl ?? '/images/common/thumbnail-default.png'}
                    alt=""
                    width={48}
                    height={48}
                    className={styles.scoreAvatarImg}
                  />
                </div>
                <p className={styles.scoreTitle}>
                  {moreGuiltyParticipant ? (
                    <>
                      <span className={styles.scoreTitleName}>{moreGuiltyParticipant.name ?? '상대방'}님</span>
                      이 더 잘못했어요
                    </>
                  ) : (
                    '두 분의 잘못이 비슷해요'
                  )}
                </p>
              </div>

              <div className={styles.barWrapper}>
                <div className={styles.bar}>
                  <div
                    className={`${styles.barSegment} ${ratioA >= ratioB ? styles.barDark : styles.barLight}`}
                    style={{ width: `${ratioA}%` }}
                  />
                  <div
                    className={`${styles.barSegment} ${ratioB > ratioA ? styles.barDark : styles.barLight}`}
                    style={{ width: `${ratioB}%` }}
                  />
                </div>
                <div className={styles.barCenter}>
                  <div className={styles.centerLine} />
                  <span className={styles.centerLabel}>잘못한 점수</span>
                </div>
              </div>

              <div className={styles.barLabels}>
                <span>{nameA}님</span>
                <span>{nameB}님</span>
              </div>
            </div>
          )
        })()}

        <div className={styles.cards}>
          {judgment.aFault && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <Avatar src={participantA?.profileImageUrl ?? null} />
                <span className={styles.cardLabel}>{nameA}님의 잘못</span>
              </div>
              <p className={styles.cardContent}>{replaceRoleNames(judgment.aFault, nameA, nameB)}</p>
            </div>
          )}

          {/* B의 잘못은 2인 판결에서만 노출 */}
          {!isSolo && judgment.bFault && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <Avatar src={participantB?.profileImageUrl ?? null} />
                <span className={styles.cardLabel}>{nameB}님의 잘못</span>
              </div>
              <p className={styles.cardContent}>{replaceRoleNames(judgment.bFault, nameA, nameB)}</p>
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
            src="/images/characters/character-gift.svg"
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
                  <span className={styles.cardLabel}>{nameA}님</span>
                </div>
                <p className={styles.cardContent}>{replaceRoleNames(judgment.aSuggestedLine, nameA, nameB)}</p>
              </div>
            )}

            {!isSolo && judgment.bSuggestedLine && (
              <div className={styles.suggestedCard}>
                <div className={styles.cardHeader}>
                  <Avatar src={participantB?.profileImageUrl ?? null} />
                  <span className={styles.cardLabel}>{nameB}님</span>
                </div>
                <p className={styles.cardContent}>{replaceRoleNames(judgment.bSuggestedLine, nameA, nameB)}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
