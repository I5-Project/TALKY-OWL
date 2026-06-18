'use client';

import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import styles from './terms.module.scss';

export default function TermsPage() {
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
        <h1 className={styles.title}>이용약관</h1>
      </header>

      <main className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제1조 (목적)</h2>
          <p className={styles.sectionBody}>
            본 약관은 말해부엉(이하 &quot;서비스&quot;)이 제공하는 AI 갈등 조정
            판결 서비스의 이용 조건 및 절차, 이용자와 서비스 간의 권리·의무 및
            책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제2조 (서비스의 내용)</h2>
          <p className={styles.sectionBody}>
            서비스는 이용자가 갈등 상황을 AI와 정리하고, 단독 또는 상대방과 함께
            진술을 작성하여 AI 기반 판결 및 관계 회복 제안을 받을 수 있는
            플랫폼을 제공합니다. AI 판결 결과는 참고용이며, 법적 효력을 갖지
            않습니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제3조 (이용자의 의무)</h2>
          <p className={styles.sectionBody}>
            이용자는 서비스 이용 시 타인의 권리를 침해하거나 허위 정보를
            제공해서는 안 됩니다. 욕설, 혐오 표현, 폭력적 내용 등 부적절한
            표현을 사용할 경우 서비스 이용이 제한될 수 있습니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제4조 (AI 판결의 한계)</h2>
          <p className={styles.sectionBody}>
            AI 판결은 이용자가 제공한 진술 내용을 기반으로 생성되며, 사실관계의
            정확성을 보장하지 않습니다. 판결 결과는 갈등 해결을 위한 참고 자료로만
            활용되어야 하며, 법률적 판단이나 공식적 중재를 대체하지 않습니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제5조 (서비스 이용 제한)</h2>
          <p className={styles.sectionBody}>
            서비스는 다음 각 호에 해당하는 경우 사전 통보 없이 이용을 제한할 수
            있습니다: 부적절한 표현의 반복 사용, 타인의 개인정보 무단 기재,
            서비스의 정상적 운영을 방해하는 행위, 기타 관련 법령에 위배되는 행위.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제6조 (서비스의 변경 및 중단)</h2>
          <p className={styles.sectionBody}>
            서비스는 운영상, 기술상의 필요에 따라 제공하는 서비스의 전부 또는
            일부를 변경하거나 중단할 수 있습니다. 서비스 내용의 변경 또는 중단에
            대해서는 사전에 공지합니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제7조 (면책 조항)</h2>
          <p className={styles.sectionBody}>
            서비스는 AI 기술을 활용하여 판결 결과를 생성하며, 이에 대한 완전성,
            정확성, 신뢰성을 보장하지 않습니다. 이용자가 판결 결과를 근거로
            행동하여 발생한 손해에 대해 서비스는 책임을 지지 않습니다.
          </p>
        </section>
      </main>
    </div>
  );
}
