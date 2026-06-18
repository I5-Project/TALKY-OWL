'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import Spinner from '@/components/ui/Spinner'
import StatusBadge from '@/components/ui/StatusBadge'
import CategoryIcon from '@/components/ui/CategoryIcon'
import type { DisputeDto } from '@/types/dispute'
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

  const [dispute, setDispute] = React.useState<DisputeDto | null>(null)
  const [fetchLoading, setFetchLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState('statement')
  const [showSoloModal, setShowSoloModal] = React.useState(false)
  const [isJudging, setIsJudging] = React.useState(false)

  React.useEffect(() => {
    fetch(`/api/disputes/${id}`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setDispute(json.data) })
      .finally(() => setFetchLoading(false))
  }, [id])

  const isCompleted = dispute !== null && (COMPLETED_STATUSES as readonly string[]).includes(dispute.status)
  const isSolo = dispute !== null && dispute.participants.length === 1
  const roleAStatement = dispute?.statements?.find((s) => s.role === 'role_a')
  const roleBStatement = dispute?.statements?.find((s) => s.role === 'role_b')

  const runJudge = async () => {
    setShowSoloModal(false)
    setIsJudging(true)
    try {
      await fetch(`/api/disputes/${id}/judge`, { method: 'POST' })
      router.refresh()
    } catch {
      setIsJudging(false)
    }
  }

  if (fetchLoading) return null

  if (isJudging || dispute?.status === 'judging') {
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
          <AutorenewRoundedIcon sx={{ fontSize: 24, color: 'var(--icon-secondary)', flexShrink: 0 }} />
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

      {/* 탭 (진행완료만) */}
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

      {/* 판결받기 푸터 (진행중만) */}
      {!isCompleted && (
        <div className={styles.footer}>
          <Button
            onClick={() => isSolo ? setShowSoloModal(true) : void runJudge()}
          >
            판결받기
          </Button>
        </div>
      )}

      {/* 1인 판결 모달 — 추후 공통 Modal 컴포넌트로 교체 예정 */}
      {showSoloModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <p className={styles.modalText}>{'정확한 결과를 위해\n상대를 초대해 판결을 진행하세요!'}</p>
            <div className={styles.modalActions}>
              <Button variant="outline" onClick={() => void runJudge()}>혼자서 진행</Button>
              <Button onClick={() => router.push(`/rooms/${dispute.roomId}/invite`)}>상대방 초대</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
