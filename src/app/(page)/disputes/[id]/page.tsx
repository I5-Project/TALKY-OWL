'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import Spinner from '@/components/ui/Spinner'
import StatusBadge from '@/components/ui/StatusBadge'
import CategoryIcon from '@/components/ui/CategoryIcon'
import InviteChoiceModal from '@/components/room/InviteChoiceModal'
import { useDispute, useRequestJudgment, useCloseDispute, disputeKeys } from '@/domains/dispute/dispute.hooks'
import { useToastStore } from '@/stores/toastStore'
import styles from './DisputePage.module.scss'

const COMPLETED_STATUSES = ['judged', 'closed'] as const
const TABS = [
  { id: 'statement', label: '진술' },
  { id: 'judgement', label: '판결' },
]
const CATEGORY_BG: Record<string, string> = {
  romance: 'var(--category-love-bg)',
  work:    'var(--category-work-bg)',
  friend:  'var(--category-friend-bg)',
  family:  'var(--category-family-bg)',
}

export default function DisputePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: dispute, isLoading: fetchLoading } = useDispute(id)
  const { mutate: requestJudgment, isPending: isJudging } = useRequestJudgment(id)
  const { mutate: closeDispute, isPending: isClosing } = useCloseDispute(id)
  const showToast = useToastStore((s) => s.show)

  const [activeTab, setActiveTab] = React.useState('statement')
  const [showSoloModal, setShowSoloModal] = React.useState(false)
  const [isInviting, setIsInviting] = React.useState(false)

  const isCompleted = dispute !== undefined && (COMPLETED_STATUSES as readonly string[]).includes(dispute.status)
  const canJudge = dispute?.status === 'waiting_opponent' || dispute?.status === 'both_submitted'
  const isSolo = dispute !== undefined && dispute.participants.length === 1
  const roleAStatement = dispute?.statements?.find((s) => s.role === 'role_a')
  const roleBStatement = dispute?.statements?.find((s) => s.role === 'role_b')

  const handleInvite = async () => {
    if (isInviting || !dispute) return
    setIsInviting(true)
    setShowSoloModal(false)
    try {
      const res = await fetch(`/api/rooms/${dispute.roomId}/invite`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        showToast('초대 링크 발급에 실패했어요.')
        return
      }
      await navigator.clipboard.writeText(data.data.inviteUrl)
      showToast('초대 링크가 복사되었어요!')
    } catch {
      showToast('초대 링크 발급에 실패했어요.')
    } finally {
      setIsInviting(false)
    }
  }

  const runJudge = () => {
    setShowSoloModal(false)
    requestJudgment(undefined, {
      onError: (error) => showToast(error instanceof Error ? error.message : 'AI 판결 요청에 실패했습니다.'),
    })
  }

  if (fetchLoading) return null

  if (isJudging) {
    return (
      <div className={styles.judgingScreen}>
        <div className={styles.judgingContent}>
          <Spinner />
          <p className={styles.judgingText}>{'작성한 진술서를 바탕으로\n분석중이에요'}</p>
        </div>
      </div>
    )
  }

  if (!dispute) {
    return (
      <div className={styles.page}>
        <Header title="사건조회" onBack={() => router.back()} />
        <p className={styles.empty}>사건을 찾을 수 없습니다.</p>
      </div>
    )
  }

  const formattedDate = dispute.createdAt.slice(2, 10)

  return (
    <div className={styles.page}>
      <Header title="사건조회" onBack={() => router.back()} />

      {/* 사건 정보 카드 */}
      <section className={styles.infoCard}>
        <div className={styles.infoRow}>
          <div className={styles.infoTitleGroup}>
            <div
              className={styles.categoryChip}
              style={{ backgroundColor: CATEGORY_BG[dispute.categoryGroup] }}
            >
              <CategoryIcon category={dispute.categoryGroup} />
            </div>
            <span className={styles.infoTitle}>{dispute.title}</span>
          </div>
          <AutorenewRoundedIcon
            sx={{ fontSize: 24, color: 'var(--icon-secondary)', flexShrink: 0, cursor: 'pointer' }}
            onClick={() => queryClient.invalidateQueries({ queryKey: disputeKeys.detail(id) })}
          />
        </div>

        {dispute.description && (
          <p className={styles.infoDesc}>{dispute.description}</p>
        )}

        <div className={styles.infoMeta}>
          <div className={styles.infoDateGroup}>
            <div className={styles.avatarStack}>
              {dispute.participants.slice(0, 2).map((p) => (
                <div key={p.id} className={styles.avatar}>
                  {p.profileImageUrl ? (
                    <img src={p.profileImageUrl} alt="" className={styles.avatarImg} />
                  ) : (
                    <div className={styles.avatarFallback} />
                  )}
                </div>
              ))}
            </div>
            <span className={styles.infoDate}>{formattedDate}</span>
          </div>
          <StatusBadge status={dispute.status} />
        </div>
      </section>

      {/* 초대 배너 (단독 + 미완료) */}
      {isSolo && !isCompleted && (
        <button
          className={styles.inviteBanner}
          onClick={() => router.push(`/rooms/${dispute.roomId}/invite`)}
        >
          <div className={styles.inviteBannerText}>
            <span className={styles.inviteBannerTitle}>상대를 초대해</span>
            <span className={styles.inviteBannerDesc}>더 좋은 판결 결과를 얻어보세요</span>
          </div>
          <span className={styles.inviteBannerPlus}>+</span>
        </button>
      )}

      {/* 탭 (판결 완료 후) */}
      {isCompleted && (
        <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />
      )}

      {/* 컨텐츠 */}
      <div className={isCompleted ? styles.content : styles.contentWithFooter}>
        {(!isCompleted || activeTab === 'statement') && (
          <div className={styles.statements}>
            {roleAStatement && (
              <div className={styles.statementCard}>
                <p className={styles.statementLabel}>A의 진술</p>
                <p className={styles.statementContent}>{roleAStatement.content}</p>
              </div>
            )}
            {roleBStatement && (
              <div className={styles.statementCard}>
                <p className={styles.statementLabel}>B의 진술</p>
                <p className={styles.statementContent}>{roleBStatement.content}</p>
              </div>
            )}
            {!roleAStatement && !roleBStatement && (
              <p className={styles.empty}>작성된 진술이 없습니다.</p>
            )}
          </div>
        )}

        {isCompleted && activeTab === 'judgement' && (
          <div className={styles.judgementPlaceholder}>
            <p className={styles.empty}>판결 결과 준비 중</p>
          </div>
        )}
      </div>

      {/* 푸터 (진행중만) */}
      {!isCompleted && (
        <div className={styles.footer}>
          <div className={styles.footerRow}>
            <Button
              variant="outline"
              disabled={isClosing}
              onClick={() => closeDispute(undefined, {
                onError: (error) => showToast(error instanceof Error ? error.message : '사건 종료에 실패했습니다.'),
              })}
            >
              {isClosing ? '종료 중...' : '사건종료'}
            </Button>
            <Button
              disabled={!canJudge}
              onClick={() => isSolo ? setShowSoloModal(true) : void runJudge()}
            >
              판결받기
            </Button>
          </div>
        </div>
      )}

      <InviteChoiceModal
        open={showSoloModal}
        onClose={() => setShowSoloModal(false)}
        onAlone={() => void runJudge()}
        onInvite={() => void handleInvite()}
      />
    </div>
  )
}
