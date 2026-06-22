import BackButton from '@/components/ui/BackButton';
import styles from './privacy.module.scss';

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <BackButton className={styles.backButton} />
        <h1 className={styles.title}>개인정보 처리방침</h1>
        <span className={styles.spacer} />
      </header>

      <main className={styles.content}>
        <p className={styles.intro}>
          말해부엉 서비스(이하 &quot;서비스&quot;)를 운영하는 말해부엉 팀(이하
          &quot;운영팀&quot;)은 이용자의 개인정보를 중요시하며, 개인정보 보호법,
          정보통신망 이용촉진 및 정보보호 등에 관한 법률 등 관련 법령을 준수하고
          있습니다. 본 개인정보 처리방침은 이용자의 개인정보가 어떤 목적과
          방법으로 수집, 이용, 보관, 파기되는지에 대해 안내합니다.
        </p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            제1조 (수집하는 개인정보 항목 및 수집 방법)
          </h2>
          <div className={styles.sectionBody}>
            <p>
              1. 운영팀은 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.
            </p>
            <p className={styles.indent}>
              가. 회원가입 시 수집 항목 (카카오 소셜 로그인): 카카오 계정 고유
              ID, 닉네임, 프로필 이미지(선택), 이메일 주소(선택)
            </p>
            <p className={styles.indent}>
              나. 서비스 이용 과정에서 생성·수집되는 정보: 서비스 내 자동 생성
              닉네임, AI 대화 내용, 진술 작성 내용, 감정일기 내용, AI 판결 결과,
              사건 생성 및 진행 이력, 갈등 카테고리 선택 정보
            </p>
            <p className={styles.indent}>
              다. 자동 수집 정보: 접속 로그, 접속 IP 주소, 브라우저 종류 및 버전,
              운영체제 정보, 서비스 이용 일시, 쿠키(Cookie) 정보
            </p>
            <p>2. 개인정보 수집 방법은 다음과 같습니다.</p>
            <p className={styles.indent}>
              가. 카카오 소셜 로그인을 통한 자동 수집
            </p>
            <p className={styles.indent}>
              나. 서비스 이용 과정에서 이용자의 직접 입력
            </p>
            <p className={styles.indent}>
              다. 서비스 이용 과정에서 자동으로 생성·수집되는 정보
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            제2조 (개인정보의 수집 및 이용 목적)
          </h2>
          <div className={styles.sectionBody}>
            <p>
              운영팀은 수집한 개인정보를 다음의 목적을 위해 이용합니다.
            </p>
            <p>
              1. 회원 관리: 회원 식별 및 인증, 회원제 서비스 제공, 카카오 계정
              연동, 부정 이용 방지, 각종 공지 전달
            </p>
            <p>
              2. AI 갈등 조정 판결 서비스 제공: AI 대화방을 통한 갈등 정리, 진술
              내용 기반 AI 판결 생성, 판결 결과(판결 점수, 핵심 쟁점 요약, 판결
              근거, 화해 제안, 화해 메시지, 선물추천 문구) 제공, 결과 카드 이미지
              생성 및 저장
            </p>
            <p>
              3. 초대 및 참여 관리: 초대 링크 발급 및 검증, 상대방 참여 처리,
              사건 참여자 식별
            </p>
            <p>
              4. 감정일기 및 달력 서비스: 감정일기 작성·조회·관리, 달력을 통한
              사건 이력 및 감정일기 조회
            </p>
            <p>
              5. 통계 서비스: 이용자별 갈등 카테고리 현황 등 요약 통계 제공
            </p>
            <p>
              6. 서비스 개선: 서비스 이용 현황 분석, 신규 서비스 개발 및 기존
              서비스 개선을 위한 통계 분석(비식별 처리 후 활용)
            </p>
            <p>
              7. 분쟁 해결 및 법적 의무 이행: 서비스 이용 관련 분쟁 처리, 관련
              법령에 따른 의무 이행
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제3조 (AI 데이터 처리)</h2>
          <div className={styles.sectionBody}>
            <p>
              1. 서비스는 AI 판결 생성을 위해 이용자의 진술 내용과 AI 대화 내용을
              외부 AI 모델(Google Gemini API)에 전달합니다.
            </p>
            <p>
              2. AI 모델에 전달되는 데이터는 판결 생성 목적으로만 사용되며, AI
              모델의 학습 데이터로 활용되지 않습니다. 이는 Google Gemini API의
              데이터 사용 정책에 따릅니다.
            </p>
            <p>
              3. AI 처리 과정에서 개인을 식별할 수 있는 정보(이름, 연락처, 주소
              등)는 최소화하여 전달하며, 이용자는 진술 작성 시 개인 식별 정보의
              기재를 자제할 것을 권장합니다.
            </p>
            <p>
              4. AI 대화 내용 및 진술 내용은 서비스 서버에 저장되며, 판결 생성
              완료 후에도 이용자의 조회 목적으로 보관됩니다.
            </p>
            <p>
              5. 부적절한 표현(욕설, 혐오 표현 등)의 필터링을 위해 이용자가
              입력한 내용에 대한 자동 검사가 수행될 수 있으며, 필터링 결과(차단
              여부)는 로그에 기록될 수 있습니다. 다만, 필터링 로그에 원문 내용은
              포함하지 않습니다.
            </p>
            <p>
              6. AI 모델의 기술적 한계로 인해 부정확하거나 부적절한 결과가 생성될
              수 있으며, 이에 대한 책임은 운영팀에 있지 않습니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            제4조 (개인정보의 보유 및 이용 기간)
          </h2>
          <div className={styles.sectionBody}>
            <p>
              1. 이용자의 개인정보는 서비스 이용 기간 동안 보유하며, 회원 탈퇴 시
              지체 없이 파기합니다.
            </p>
            <p>
              2. 다만, 다음의 정보에 대해서는 관련 법령에 따라 아래 명시한 기간
              동안 보존합니다.
            </p>
            <p className={styles.indent}>
              가. 계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래 등에서의
              소비자 보호에 관한 법률)
            </p>
            <p className={styles.indent}>
              나. 대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래 등에서의
              소비자 보호에 관한 법률)
            </p>
            <p className={styles.indent}>
              다. 소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래
              등에서의 소비자 보호에 관한 법률)
            </p>
            <p className={styles.indent}>
              라. 로그인 기록: 3개월 (통신비밀보호법)
            </p>
            <p className={styles.indent}>
              마. 표시·광고에 관한 기록: 6개월 (전자상거래 등에서의 소비자 보호에
              관한 법률)
            </p>
            <p>
              3. 삭제된 사건 및 감정일기의 원문 데이터는 비식별 처리 후 통계
              목적으로만 보관될 수 있습니다. 비식별 처리된 데이터는 개인을 식별할
              수 없는 형태로 변환되며, 서비스 개선을 위한 통계 분석에만
              활용됩니다.
            </p>
            <p>
              4. 이용자의 요청에 따라 비식별 처리된 통계 데이터의 삭제를 별도로
              요청할 수 있습니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            제5조 (개인정보의 제3자 제공)
          </h2>
          <div className={styles.sectionBody}>
            <p>
              1. 운영팀은 원칙적으로 이용자의 동의 없이 개인정보를 제3자에게
              제공하지 않습니다.
            </p>
            <p>
              2. 다만, 다음의 경우에는 예외로 합니다.
            </p>
            <p className={styles.indent}>
              가. 이용자가 사전에 제3자 제공에 동의한 경우
            </p>
            <p className={styles.indent}>
              나. 법령의 규정에 의하거나, 수사 목적으로 법령에 정해진 절차와
              방법에 따라 수사기관의 요구가 있는 경우
            </p>
            <p className={styles.indent}>
              다. 서비스 제공에 따른 요금 정산을 위해 필요한 경우
            </p>
            <p className={styles.indent}>
              라. 통계 작성, 학술 연구 또는 시장 조사를 위해 필요한 경우로서 특정
              개인을 알아볼 수 없는 형태로 가공하여 제공하는 경우
            </p>
            <p>
              3. AI 판결 생성을 위해 이용자의 진술 내용이 Google Gemini API로
              전달되며, 이는 서비스 제공을 위한 처리 위탁에 해당합니다. 자세한
              내용은 제3조(AI 데이터 처리)를 참조하시기 바랍니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            제6조 (개인정보 처리의 위탁)
          </h2>
          <div className={styles.sectionBody}>
            <p>
              1. 운영팀은 서비스 제공을 위해 다음과 같이 개인정보 처리를
              위탁하고 있습니다.
            </p>
            <p className={styles.indent}>
              가. 수탁업체: Google LLC / 위탁 업무: AI 판결 생성을 위한 자연어
              처리(Google Gemini API) / 보유 기간: API 호출 시 일시적 처리 후
              즉시 삭제
            </p>
            <p className={styles.indent}>
              나. 수탁업체: Supabase Inc. / 위탁 업무: 데이터베이스 호스팅 및
              파일 스토리지 / 보유 기간: 서비스 이용 기간
            </p>
            <p className={styles.indent}>
              다. 수탁업체: Vercel Inc. / 위탁 업무: 웹 애플리케이션 호스팅 및
              배포 / 보유 기간: 서비스 이용 기간
            </p>
            <p className={styles.indent}>
              라. 수탁업체: 카카오 주식회사 / 위탁 업무: 소셜 로그인 인증 / 보유
              기간: 서비스 이용 기간
            </p>
            <p>
              2. 위탁 계약 시 개인정보 보호 관련 법규의 준수, 개인정보에 관한
              비밀 유지, 제3자 제공 금지, 사고 시 책임 부담, 위탁 기간 종료 후
              개인정보의 반환 또는 파기 의무 등을 규정하고, 이를 준수하도록
              관리·감독합니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            제7조 (이용자의 권리와 행사 방법)
          </h2>
          <div className={styles.sectionBody}>
            <p>
              1. 이용자는 언제든지 자신의 개인정보에 대한 열람, 정정, 삭제,
              처리 정지를 요청할 수 있습니다.
            </p>
            <p>
              2. 개인정보 열람 및 정정은 서비스 내 마이페이지를 통해 직접 처리할
              수 있으며, 마이페이지에서 처리할 수 없는 사항은 운영팀에 별도로
              요청할 수 있습니다.
            </p>
            <p>
              3. 이용자는 서비스 내에서 작성한 감정일기, 사건 기록 등을 직접
              삭제할 수 있습니다. 삭제 요청 시 해당 데이터는 비식별 처리되며,
              원문은 복구할 수 없습니다.
            </p>
            <p>
              4. 이용자는 회원 탈퇴를 통해 모든 개인정보의 삭제를 요청할 수
              있으며, 탈퇴 요청 시 관련 법령에 따른 보존 기간이 경과한 후 모든
              정보가 파기됩니다.
            </p>
            <p>
              5. 이용자가 개인정보의 오류에 대한 정정을 요청한 경우, 정정이
              완료될 때까지 해당 개인정보를 이용하거나 제3자에게 제공하지
              않습니다.
            </p>
            <p>
              6. 만 14세 미만 아동의 개인정보 수집 시에는 법정대리인의 동의를
              받아야 하며, 현재 서비스는 만 14세 미만 아동의 가입을 제한하고
              있습니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            제8조 (개인정보의 파기 절차 및 방법)
          </h2>
          <div className={styles.sectionBody}>
            <p>
              1. 운영팀은 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가
              불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
            </p>
            <p>
              2. 파기 절차: 이용자가 서비스 이용을 위해 제공한 정보는 목적이
              달성된 후 별도의 데이터베이스로 옮겨져 내부 방침 및 기타 관련
              법령에 의한 정보보호 사유에 따라 일정 기간 저장된 후 파기됩니다.
            </p>
            <p>
              3. 파기 방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는
              기술적 방법을 사용하여 삭제합니다.
            </p>
            <p>
              4. 삭제된 사건 및 감정일기의 경우, 원문 데이터는 즉시 파기하되
              비식별 처리된 통계 데이터는 서비스 개선 목적으로 보관될 수
              있습니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            제9조 (개인정보 보호를 위한 기술적·관리적 대책)
          </h2>
          <div className={styles.sectionBody}>
            <p>
              운영팀은 이용자의 개인정보를 안전하게 관리하기 위해 다음과 같은
              기술적·관리적 대책을 시행합니다.
            </p>
            <p>
              1. 데이터 암호화: 초대 링크 토큰은 해시(Hash) 처리하여 저장하며,
              토큰 원문은 서버에 저장하지 않습니다. 데이터 전송 시 SSL/TLS 암호화
              프로토콜을 적용합니다.
            </p>
            <p>
              2. 접근 통제: 개인정보에 대한 접근 권한을 최소화하고, 권한이 있는
              담당자만 개인정보에 접근할 수 있도록 관리합니다. AI 대화방 및 사건
              데이터는 생성자 또는 참여자만 조회할 수 있도록 서버에서 권한 검증을
              수행합니다.
            </p>
            <p>
              3. 민감 정보 노출 방지: 결과 카드 및 공유 이미지에 사건 원문을
              포함하지 않으며, 개인정보가 노출되지 않도록 합니다. 감정일기 원문은
              통계, 공유 이미지, 외부 추천 기능에 노출하지 않습니다.
            </p>
            <p>
              4. 로그 관리: 서비스 운영에 필요한 로그를 기록하되, 로그에는
              불필요한 사건 원문, 감정일기 원문, 개인정보를 저장하지 않습니다.
              API 오류, AI 요청 실패, 부적절 표현 필터링 결과, 삭제/비식별 처리,
              초대 링크 오류, 권한 오류 등 필수 항목만 기록합니다.
            </p>
            <p>
              5. 서비스 키 관리: Supabase Service Role Key 등 민감한 서비스 키는
              서버에서만 사용하며, 클라이언트 측에 노출하지 않습니다.
            </p>
            <p>
              6. 중복 요청 방지: AI 판결 생성, 진술 종료, 초대 참여, 삭제/비식별
              처리 등 주요 요청에 대해 중복 처리를 방지하는 멱등성 메커니즘을
              적용합니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            제10조 (쿠키의 설치·운영 및 거부)
          </h2>
          <div className={styles.sectionBody}>
            <p>
              1. 운영팀은 이용자의 인증 상태 유지 및 서비스 이용 편의를 위해
              쿠키(Cookie)를 사용합니다.
            </p>
            <p>
              2. 쿠키는 웹사이트를 운영하는 데 이용되는 서버가 이용자의 브라우저에
              보내는 소량의 정보로, 이용자의 접속 기기(PC, 모바일 등)에 저장됩니다.
            </p>
            <p>
              3. 쿠키의 사용 목적: 로그인 인증 상태 유지(NextAuth 세션), 서비스
              이용 환경 설정 저장
            </p>
            <p>
              4. 이용자는 쿠키의 설치에 대한 선택권을 가지고 있으며, 웹 브라우저
              설정을 통해 쿠키 허용, 쿠키 차단 등의 옵션을 설정할 수 있습니다.
              다만, 쿠키를 차단하는 경우 로그인이 필요한 일부 서비스 이용에
              제한이 있을 수 있습니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            제11조 (개인정보 보호책임자 및 연락처)
          </h2>
          <div className={styles.sectionBody}>
            <p>
              1. 운영팀은 개인정보 처리에 관한 업무를 총괄해서 책임지고,
              개인정보 처리와 관련한 이용자의 불만 처리 및 피해 구제를 위하여
              다음과 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <p className={styles.indent}>
              개인정보 보호책임자: 말해부엉 운영팀
            </p>
            <p className={styles.indent}>
              문의처: 서비스 내 마이페이지 문의 또는 서비스 공식 채널
            </p>
            <p>
              2. 이용자는 서비스를 이용하면서 발생한 모든 개인정보 보호 관련
              문의, 불만 처리, 피해 구제 등에 관한 사항을 개인정보 보호책임자에게
              문의할 수 있습니다. 운영팀은 이용자의 문의에 대해 지체 없이 답변 및
              처리합니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            제12조 (권익침해 구제 방법)
          </h2>
          <div className={styles.sectionBody}>
            <p>
              이용자는 개인정보 침해에 대한 구제를 받기 위해 다음의 기관에 상담
              및 신고를 할 수 있습니다.
            </p>
            <p className={styles.indent}>
              1. 개인정보 침해신고센터 (한국인터넷진흥원 운영) — 전화:
              (국번없이) 118 / 홈페이지: privacy.kisa.or.kr
            </p>
            <p className={styles.indent}>
              2. 개인정보 분쟁조정위원회 — 전화: (국번없이) 1833-6972 /
              홈페이지: www.kopico.go.kr
            </p>
            <p className={styles.indent}>
              3. 대검찰청 사이버수사과 — 전화: (국번없이) 1301 / 홈페이지:
              www.spo.go.kr
            </p>
            <p className={styles.indent}>
              4. 경찰청 사이버수사국 — 전화: (국번없이) 182 / 홈페이지:
              ecrm.police.go.kr
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            제13조 (개인정보 처리방침의 변경)
          </h2>
          <div className={styles.sectionBody}>
            <p>
              1. 본 개인정보 처리방침은 법령, 정책 또는 서비스 변경에 따라
              수정될 수 있으며, 변경 시 서비스 화면을 통해 공지합니다.
            </p>
            <p>
              2. 개인정보 처리방침 변경 시 시행일자, 변경 내용을 명시하여 변경
              시행일 7일 전부터 공지합니다. 다만, 이용자의 권리에 중대한 변경이
              있는 경우 30일 전부터 공지합니다.
            </p>
            <p>
              3. 이용자는 변경된 개인정보 처리방침에 동의하지 않을 경우 서비스
              이용을 중단하고 탈퇴할 수 있습니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionBody}>
            부칙: 본 개인정보 처리방침은 2025년 6월 1일부터 시행합니다.
          </p>
        </section>
      </main>
    </div>
  );
}
