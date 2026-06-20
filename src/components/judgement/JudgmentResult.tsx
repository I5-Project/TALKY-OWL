'use client'

import Image from 'next/image'
import type { AiJudgmentDto } from '@/types/judgment'
import type { DisputeParticipantDto } from '@/types/dispute'
import styles from './JudgmentResult.module.scss'

interface Props {
  judgment: AiJudgmentDto
  // 프로필 이미지·역할 정보 활용을 위해 dispute 참여자 목록을 받음
  participants: DisputeParticipantDto[]
}

export default function JudgmentResult({ judgment, participants }: Props) {
  // 참여자가 1명이면 단독 판결 — 프로필·점수바 미노출
  const isSolo = participants.length === 1

  // 2인 판결에서 더 잘못한 쪽의 참여자 정보 (프로필 이미지 출력용)
  const responsibleParticipant = !isSolo && judgment.moreResponsibleRole
    ? participants.find((p) => p.role === judgment.moreResponsibleRole)
    : null

  // 점수바: A의 잘못 비율을 % 너비로 표현 (0~100 범위를 그대로 사용)
  const scoreAPercent = judgment.verdictScoreA

  return (
    <div className={styles.container}>

      {/* ── 2인 전용: 더 잘못한 쪽 프로필 + 점수바 ── */}
      {!isSolo && (
        <div className={styles.verdictHeader}>
          {/* 프로필 이미지: 없으면 기본 아바타 fallback */}
          <div className={styles.profileWrapper}>
            {responsibleParticipant?.profileImageUrl ? (
              <Image
                src={responsibleParticipant.profileImageUrl}
                alt="더 잘못한 참여자 프로필"
                width={56}
                height={56}
                className={styles.profileImage}
              />
            ) : (
              <div className={styles.profileFallback} />
            )}
          </div>

          {/* 누가 더 잘못했는지 — EQUAL이면 "서로 비슷하게 잘못했어요" */}
          <p className={styles.responsibleLabel}>
            {judgment.moreResponsibleRole === 'equal'
              ? '서로 비슷하게 잘못했어요'
              : judgment.moreResponsibleRole === 'role_a'
              ? 'A님이 더 잘못했어요'
              : 'B님이 더 잘못했어요'}
          </p>

          {/* 점수바: A 책임 비율이 크면 왼쪽(A 영역)이 넓어짐 */}
          <div className={styles.scoreBarWrapper}>
            <div
              className={styles.scoreBarA}
              style={{ width: `${scoreAPercent}%` }}
            />
            <div className={styles.scoreBarDivider} />
            <div
              className={styles.scoreBarB}
              style={{ width: `${100 - scoreAPercent}%` }}
            />
          </div>

          <div className={styles.scoreLabels}>
            <span className={styles.scoreLabelA}>A</span>
            <span className={styles.scoreLabelCenter}>잘못한 점수</span>
            <span className={styles.scoreLabelB}>B</span>
          </div>
        </div>
      )}

      {/* ── 공통: 핵심 쟁점 요약 + 잘못 카드 ── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>판결결과</h3>

        <div className={styles.faultCards}>
          {/* A의 잘못 — 항상 존재 */}
          {judgment.aFault && (
            <div className={styles.faultCard}>
              <div className={styles.faultCardHeader}>
                {/* 참여자 아바타 자리 */}
                <div className={styles.faultAvatar} />
                <span className={styles.faultRole}>A의 잘못</span>
              </div>
              <p className={styles.faultContent}>{judgment.aFault}</p>
            </div>
          )}

          {/* B의 잘못 — 2인 판결에서만 존재 */}
          {judgment.bFault && (
            <div className={styles.faultCard}>
              <div className={styles.faultCardHeader}>
                <div className={styles.faultAvatar} />
                <span className={styles.faultRole}>B의 잘못</span>
              </div>
              <p className={styles.faultContent}>{judgment.bFault}</p>
            </div>
          )}
        </div>

        {/* AI 답변 고지 — 판결 결과를 맹신하지 않도록 사용자에게 안내 */}
        <p className={styles.aiNotice}>AI의 답변결과이니 참고용으로만 봐주세요</p>
      </section>

      {/* ── 공통: 화해 제안 ── */}
      {(judgment.aSuggestedLine || judgment.bSuggestedLine) && (
        <section className={styles.section}>
          <div className={styles.reconcileHeader}>
            <h3 className={styles.sectionTitle}>이렇게 사과해보면 어떨까요?</h3>
            {/* 선물 이모지 이미지: 화해 섹션 분위기를 부드럽게 연출 */}
            <Image
              src="/images/characters/character-gift.png"
              alt=""
              width={44}
              height={44}
              className={styles.reconcileIcon}
            />
          </div>

          <div className={styles.suggestedLines}>
            {judgment.aSuggestedLine && (
              <div className={styles.suggestedCard}>
                <div className={styles.faultCardHeader}>
                  <div className={styles.faultAvatar} />
                  <span className={styles.faultRole}>A님</span>
                </div>
                <p className={styles.suggestedContent}>{judgment.aSuggestedLine}</p>
              </div>
            )}

            {judgment.bSuggestedLine && (
              <div className={styles.suggestedCard}>
                <div className={styles.faultCardHeader}>
                  <div className={styles.faultAvatar} />
                  <span className={styles.faultRole}>B님</span>
                </div>
                <p className={styles.suggestedContent}>{judgment.bSuggestedLine}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
