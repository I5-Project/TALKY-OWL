'use client';

import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import styles from './privacy.module.scss';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.back()}
          aria-label="뒤로 가기"
        >
          <ArrowBackIcon />
        </button>
        <h1 className={styles.title}>개인정보 처리방침</h1>
      </header>

      <main className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제1조 (수집하는 개인정보 항목)</h2>
          <p className={styles.sectionBody}>
            서비스는 회원가입 및 서비스 이용을 위해 다음 개인정보를 수집합니다:
            카카오 계정 정보(고유 ID, 닉네임), 서비스 내 작성 진술 내용, AI 대화
            내용, 감정일기 내용. 서비스 이용 과정에서 접속 로그, 접속 IP 정보가
            자동으로 생성되어 수집될 수 있습니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            제2조 (개인정보의 수집 및 이용 목적)
          </h2>
          <p className={styles.sectionBody}>
            수집된 개인정보는 다음 목적으로 이용됩니다: 회원 식별 및 인증, AI 갈등
            조정 판결 서비스 제공, 진술 기반 AI 판결 결과 생성, 감정일기 및 통계
            기능 제공, 서비스 개선 및 신규 서비스 개발을 위한 통계 분석.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제3조 (AI 데이터 처리)</h2>
          <p className={styles.sectionBody}>
            서비스는 AI 판결 생성을 위해 이용자의 진술 내용과 대화 내용을 AI
            모델(Google Gemini)에 전달합니다. 전달된 데이터는 판결 생성 목적으로만
            사용되며, AI 모델의 학습 데이터로 활용되지 않습니다. AI 처리 과정에서
            개인을 식별할 수 있는 정보는 최소화하여 전달합니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            제4조 (개인정보의 보유 및 이용 기간)
          </h2>
          <p className={styles.sectionBody}>
            이용자의 개인정보는 서비스 이용 기간 동안 보유하며, 회원 탈퇴 시
            지체없이 파기합니다. 단, 관련 법령에 의해 보존이 필요한 경우 해당
            기간 동안 보관합니다. 삭제된 사건 및 감정일기의 원문 데이터는
            비식별 처리 후 통계 목적으로만 보관될 수 있습니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            제5조 (개인정보의 제3자 제공)
          </h2>
          <p className={styles.sectionBody}>
            서비스는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.
            다만, 법령에 의해 요구되는 경우 또는 이용자가 사전에 동의한 경우에는
            예외로 합니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            제6조 (이용자의 권리와 행사 방법)
          </h2>
          <p className={styles.sectionBody}>
            이용자는 언제든지 자신의 개인정보에 대한 열람, 수정, 삭제를 요청할 수
            있습니다. 서비스 내 마이페이지를 통해 직접 처리하거나, 서비스
            관리자에게 요청할 수 있습니다. 회원 탈퇴를 통해 모든 개인정보의 삭제를
            요청할 수 있습니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            제7조 (개인정보 보호를 위한 기술적 대책)
          </h2>
          <p className={styles.sectionBody}>
            서비스는 개인정보 보호를 위해 다음과 같은 기술적 대책을 시행합니다:
            초대 링크 토큰의 해시 처리 저장, 결과 카드 및 공유 이미지에 사건 원문
            미포함, 감정일기 원문의 외부 노출 차단, 민감 정보의 로그 기록 제한,
            데이터 전송 시 암호화 적용.
          </p>
        </section>
      </main>
    </div>
  );
}
