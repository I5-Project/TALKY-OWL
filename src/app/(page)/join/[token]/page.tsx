'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import JoinStatusView from '@/components/ui/JoinStatusView';
import styles from '../join.module.scss';

interface JoinInfo {
  roomId: string;
  categoryGroup: string;
  inviterNickname: string | null;
}

type JoinState = 'loading' | 'invite' | 'error' | 'closed' | 'expired';

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [state, setState] = useState<JoinState>('loading');
  const [joinInfo, setJoinInfo] = useState<JoinInfo | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    async function fetchJoinInfo() {
      try {
        const res = await fetch(`/api/rooms/join/${token}`);
        const data = await res.json();

        if (!res.ok) {
          const code = data?.error?.code;
          if (res.status === 401) {
            setShowLoginModal(true);
            return;
          }
          if (code === 'INVITE_EXPIRED') {
            setState('expired');
          } else if (code === 'ROOM_UNAVAILABLE') {
            setState('closed');
          } else {
            setState('error');
          }
          return;
        }

        setJoinInfo(data.data);
        setState('invite');
      } catch {
        setState('error');
      }
    }

    fetchJoinInfo();
  }, [token]);

  const handleJoin = async () => {
    if (isJoining) return;
    setIsJoining(true);

    try {
      const res = await fetch(`/api/rooms/join/${token}`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setShowLoginModal(true);
          return;
        }
        const data = await res.json();
        const code = data?.error?.code;
        if (code === 'INVITE_EXPIRED') {
          setState('expired');
        } else {
          setState('error');
        }
        return;
      }

      router.push(`/disputes/${data.data.disputeId}/statement`);
    } catch {
      setState('error');
    } finally {
      setIsJoining(false);
    }
  };

  const goToMain = () => router.push('/home');

  const renderContent = () => {
    if (state === 'loading') return null;

    if (state === 'error') {
      return (
        <JoinStatusView
          character={<img src="/images/characters/character-blocked.png" alt="접근 불가" />}
          message={'죄송해요\n이 페이지는 접속할 수 없어요'}
          buttonLabel="메인으로 돌아가기"
          onButtonClick={goToMain}
        />
      );
    }

    if (state === 'closed') {
      return (
        <JoinStatusView
          character={<img src="/images/characters/character-closed.png" alt="종료된 사건" />}
          message={'사건이 종료되어\n더 이상 열람할 수 없어요'}
          buttonLabel="메인으로 돌아가기"
          onButtonClick={goToMain}
        />
      );
    }

    if (state === 'expired') {
      return (
        <JoinStatusView
          character={<img src="/images/characters/character-closed.png" alt="만료된 사건" />}
          message={'초대 링크가 만료되어\n더 이상 참여할 수 없어요'}
          buttonLabel="메인으로 돌아가기"
          onButtonClick={goToMain}
        />
      );
    }

    return (
      <div className={styles.page}>
        <div className={styles.content}>
          <div className={styles.character}>
            <img src="/images/characters/character-welcome.png" alt="말해부엉 판사" />
          </div>
          <p className={styles.message}>
            <span className={styles.inviterName}>{joinInfo?.inviterNickname ?? ''}</span>
            {`님이 진술을 요청했어요`}
          </p>
        </div>
        <div className={styles.footer}>
          <Button onClick={handleJoin} disabled={isJoining}>
            진술하러 가기
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      <Modal open={showLoginModal}>
        <p className={styles.modalTitle}>로그인이 필요합니다.</p>
        <Button onClick={() => router.push(`/login?callbackUrl=/join/${token}`)}>
          로그인하러 가기
        </Button>
      </Modal>
    </>
  );
}
