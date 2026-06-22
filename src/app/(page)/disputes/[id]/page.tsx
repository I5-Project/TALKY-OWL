'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import CircularProgress from '@mui/material/CircularProgress';
import { useHeaderStore } from '@/stores/headerStore';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import Tab from '@/components/ui/Tab';
import Spinner from '@/components/ui/Spinner';
import StatusBadge from '@/components/ui/StatusBadge';
import CategoryIcon from '@/components/ui/CategoryIcon';
import InviteChoiceModal from '@/components/room/InviteChoiceModal';
import JudgmentResult from '@/components/judgement/JudgmentResult';
import JudgmentTypeResult from '@/components/judgement/JudgmentTypeResult';
import {
  useDispute,
  useRequestJudgment,
  useCloseDispute,
  disputeKeys,
} from '@/domains/dispute/dispute.hooks';
import { useJudgment } from '@/domains/judgement/judgement.hooks';
import { useUserMe } from '@/domains/user/hooks';
import { useToastStore } from '@/stores/toastStore';
import styles from './DisputePage.module.scss';

const COMPLETED_STATUSES = ['judged', 'closed'] as const;
const TABS = [
  { id: 'statement', label: '진술' },
  { id: 'judgement', label: '판결' },
];

export default function DisputePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const setHeader = useHeaderStore((s) => s.setHeader);
  React.useEffect(() => {
    setHeader({ variant: 'title', title: '사건조회', onBack: () => router.back() });
    return () => setHeader(null);
  }, []);
  const queryClient = useQueryClient();

  const pollCountRef = React.useRef(0);
  const MAX_POLL = 15;
  const [pollExhausted, setPollExhausted] = React.useState(false);

  const { data: dispute, isLoading: fetchLoading } = useDispute(id, {
    refetchInterval: (query) => {
      const d = query.state.data;
      if (!d) return false;
      const hasStatement = d.statements?.some((s) => s.role === 'role_a' && s.content);
      const isTerminal = (COMPLETED_STATUSES as readonly string[]).includes(d.status);
      if (d.title === '새 사건' && hasStatement && !isTerminal) {
        if (pollCountRef.current >= MAX_POLL) {
          setPollExhausted(true);
          return false;
        }
        pollCountRef.current += 1;
        return 2000;
      }
      pollCountRef.current = 0;
      return false;
    },
  });
  const { mutate: requestJudgment, isPending: isJudging } = useRequestJudgment(id);
  const { mutate: closeDispute, isPending: isClosing } = useCloseDispute(id);
  const { data: userMe } = useUserMe();

  // judged(판결완료) + closed(종료) 모두 판결 결과 탭 노출
  const isCompleted =
    !!dispute && (COMPLETED_STATUSES as readonly string[]).includes(dispute.status);

  const isExtractingMeta =
    !!dispute &&
    dispute.title === '새 사건' &&
    dispute.statements?.some((s) => s.role === 'role_a' && s.content) &&
    !isCompleted &&
    !pollExhausted;

  const META_MESSAGES = [
    '사건 정보를 분석하고 있어요',
    'AI가 핵심 쟁점을 파악하고 있어요',
    '진술 내용을 정리하고 있어요',
    '거의 다 됐어요, 잠시만요',
  ];
  const [metaMsgIdx, setMetaMsgIdx] = React.useState(0);
  React.useEffect(() => {
    if (!isExtractingMeta) return;
    const timer = setInterval(() => {
      setMetaMsgIdx((i) => (i + 1) % META_MESSAGES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [isExtractingMeta]);

  // 판결 완료/종료 상태일 때만 fetch — 불필요한 API 호출 방지
  const {
    data: judgment,
    isLoading: judgmentLoading,
    isError: judgmentError,
  } = useJudgment(id, isCompleted);

  const showToast = useToastStore((s) => s.show);

  const [activeTab, setActiveTab] = React.useState('statement');
  const [judgmentSubTab, setJudgmentSubTab] = React.useState<'verdict' | 'type'>('verdict');
  const [showSoloModal, setShowSoloModal] = React.useState(false);
  const [isInviting, setIsInviting] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: disputeKeys.detail(id) });
    } finally {
      setIsRefreshing(false);
    }
  };

  const isSolo = dispute !== undefined && dispute.participants.length === 1;
  const roleAStatement = dispute?.statements?.find((s) => s.role === 'role_a');
  const roleBStatement = dispute?.statements?.find((s) => s.role === 'role_b');
  const canJudge = (isSolo && !!roleAStatement?.content) || dispute?.status === 'both_submitted';
  const myRole = dispute?.participants.find((p) => p.userId === userMe?.id)?.role;

  const handleInvite = async () => {
    if (isInviting || !dispute) return;
    setIsInviting(true);
    setShowSoloModal(false);
    try {
      const res = await fetch(`/api/rooms/${dispute.roomId}/invite`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        showToast('초대 링크 발급에 실패했어요.');
        return;
      }
      await navigator.clipboard.writeText(data.data.inviteUrl);
      showToast('초대 링크가 복사되었어요!');
    } catch {
      showToast('초대 링크 발급에 실패했어요.');
    } finally {
      setIsInviting(false);
    }
  };

  const runJudge = () => {
    setShowSoloModal(false);
    requestJudgment(undefined, {
      onSuccess: () => window.location.reload(),
      onError: (error) =>
        showToast(error instanceof Error ? error.message : 'AI 판결 요청에 실패했습니다.'),
    });
  };

  if (fetchLoading) return null;

  if (isExtractingMeta) {
    return (
      <div className={styles.judgingScreen}>
        <div className={styles.judgingContent}>
          <Spinner />
          <p className={styles.judgingText}>{META_MESSAGES[metaMsgIdx]}</p>
        </div>
      </div>
    );
  }

  if (isJudging) {
    return (
      <div className={styles.judgingScreen}>
        <div className={styles.judgingContent}>
          <Spinner />
          <p className={styles.judgingText}>{'작성한 진술서를 바탕으로\n분석중이에요'}</p>
        </div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className={styles.page}>
        <p className={styles.empty}>사건을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const formattedDate = dispute.createdAt.slice(2, 10);

  return (
    <div className={styles.page}>
      {/* 사건 정보 카드 */}
      <section className={styles.infoCard}>
        <div className={styles.infoRow}>
          <div className={styles.infoTitleGroup}>
            <div className={styles.categoryChip}>
              <CategoryIcon category={dispute.categoryGroup} />
            </div>
            <span className={styles.infoTitle}>{dispute.title}</span>
          </div>
          {isRefreshing ? (
            <CircularProgress
              size={24}
              thickness={3}
              sx={{ color: 'var(--icon-secondary)', flexShrink: 0 }}
            />
          ) : (
            <AutorenewRoundedIcon
              sx={{
                fontSize: 24,
                color: 'var(--icon-secondary)',
                flexShrink: 0,
                cursor: 'pointer',
              }}
              onClick={() => void handleRefresh()}
            />
          )}
        </div>

        {dispute.description && <p className={styles.infoDesc}>{dispute.description}</p>}

        <div className={styles.infoMeta}>
          <div className={styles.infoDateGroup}>
            <div className={styles.avatarStack}>
              {dispute.participants.slice(0, 2).map((p) => {
                const imgSrc =
                  p.profileImageUrl ??
                  (p.userId === userMe?.id ? userMe?.profileImageUrl : null) ??
                  '/images/common/thumbnail-default.svg';
                return (
                  <div key={p.id} className={styles.avatar}>
                    <Image src={imgSrc} alt="" fill className={styles.avatarImg} />
                  </div>
                );
              })}
            </div>
            <span className={styles.infoDate}>{formattedDate}</span>
          </div>
          <StatusBadge status={dispute.status} />
        </div>
      </section>

      {/* 초대 배너 (단독 + 미완료) */}
      {isSolo && !isCompleted && (
        <button className={styles.inviteBanner} onClick={() => void handleInvite()}>
          <div className={styles.inviteBannerText}>
            <span className={styles.inviteBannerTitle}>상대를 초대해</span>
            <span className={styles.inviteBannerDesc}>더 좋은 판결 결과를 얻어보세요</span>
          </div>
          <span className={styles.inviteBannerPlus}>+</span>
        </button>
      )}

      {/* 탭 (판결 완료 후) */}
      {isCompleted && <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />}

      {/* 컨텐츠 */}
      <div className={isCompleted ? styles.content : styles.contentWithFooter}>
        {(!isCompleted || activeTab === 'statement') && (
          <div className={styles.statements}>
            {roleAStatement && (
              <div
                className={`${styles.statementCard}${myRole === 'role_a' && !isCompleted ? ` ${styles.statementCardEditable}` : ''}`}
                onClick={myRole === 'role_a' && !isCompleted ? () => router.push(`/disputes/${id}/statement?edit=true`) : undefined}
              >
                <p className={styles.statementLabel}>A의 진술</p>
                <p className={styles.statementContent}>{roleAStatement.content}</p>
              </div>
            )}
            {roleBStatement && (
              <div
                className={`${styles.statementCard}${myRole === 'role_b' && !isCompleted ? ` ${styles.statementCardEditable}` : ''}`}
                onClick={myRole === 'role_b' && !isCompleted ? () => router.push(`/disputes/${id}/statement?edit=true`) : undefined}
              >
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
          <>
            <div className={styles.judgmentSubTabs}>
              <Tab
                items={[
                  { label: '판결', value: 'verdict' },
                  { label: '유형', value: 'type' },
                ]}
                activeValue={judgmentSubTab}
                onChange={(v) => setJudgmentSubTab(v as 'verdict' | 'type')}
              />
            </div>

            {judgmentLoading ? (
              <div className={styles.judgementPlaceholder}>
                <Spinner />
              </div>
            ) : judgmentError ? (
              <div className={styles.judgementPlaceholder}>
                <p className={styles.empty}>판결 결과를 불러올 수 없습니다.</p>
              </div>
            ) : judgmentSubTab === 'verdict' ? (
              <JudgmentResult disputeId={id} />
            ) : (
              <JudgmentTypeResult disputeId={id} />
            )}
          </>
        )}
      </div>

      {/* 푸터 (진행중만) */}
      {!isCompleted && (
        <div className={styles.footer}>
          <div className={styles.footerRow}>
            <Button
              variant="outline"
              disabled={isClosing}
              onClick={() =>
                closeDispute(undefined, {
                  onError: (error) =>
                    showToast(error instanceof Error ? error.message : '사건 종료에 실패했습니다.'),
                })
              }
            >
              {isClosing ? '종료 중...' : '사건종료'}
            </Button>
            <Button
              disabled={!canJudge}
              onClick={() => (isSolo ? setShowSoloModal(true) : void runJudge())}
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
  );
}
