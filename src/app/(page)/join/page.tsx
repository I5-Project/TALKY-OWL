'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import JoinStatusView from '@/components/ui/JoinStatusView';
import styles from './join.module.scss';

// TODO: API 연동 후 token 검증 결과로 교체
type JoinState = 'invite' | 'error' | 'closed';
const currentState: JoinState = 'invite';

// TODO: API 연동 후 초대자 정보로 교체
const inviterName = '';
const disputeTitle = '';

export default function JoinPage() {
  const router = useRouter();

  const goToMain = () => router.push('/home');

  if (currentState === 'error') {
    return (
      <JoinStatusView
        character={<img src="/images/characters/character-blocked.png" alt="접근 불가" />}
        message={'죄송해요\n이 페이지는 접속할 수 없어요'}
        buttonLabel="메인으로 돌아가기"
        onButtonClick={goToMain}
      />
    );
  }

  if (currentState === 'closed') {
    return (
      <JoinStatusView
        character={<img src="/images/characters/character-closed.png" alt="종료된 사건" />}
        message={'사건이 종료 또는 만료되어\n더 이상 열람할 수 없어요'}
        buttonLabel="메인으로 돌아가기"
        onButtonClick={goToMain}
      />
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.character}>
          {/* TODO: 판사 부엉이 이미지로 교체 */}
          <img src="/images/characters/character-welcome.png" alt="말해부엉 판사" />
        </div>
        <p className={styles.message}>
          <span className={styles.inviterName}>{inviterName}</span>
          {`님이 ${disputeTitle} 사건으로\n진술을 요청했어요`}
        </p>
      </div>
      <div className={styles.footer}>
        {/* TODO: join API 연동 후 진술 페이지로 이동 */}
        <Button onClick={() => {}}>진술하러 가기</Button>
      </div>
    </div>
  );
}
