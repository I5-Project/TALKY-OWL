# PROJECT_DECISIONS.md

TALKY-OWL 프로젝트 최종 합의사항 정리

---

## 1. 프로젝트 핵심 방향

AI 갈등 조정 판결 서비스.
사용자가 갈등 상황을 AI와 먼저 정리하고, 상대방을 초대해 1:1 조정 후 AI 판결과 관계 회복 제안을 받는다.

---

## 2. 핵심 서비스 흐름

```txt
AI 대화방 생성
→ AI 대화 (갈등 상황 입력 + AI 분석)
→ 진술저장
→ [혼자서 진행 / 상대방 초대] 선택
→ 진술 작성 (disputes/[id]/statement)
     │                        │
     ▼                        ▼
단독 AI 판결             초대 링크 발급
(판결 탭 바로 진입)       → 상대방 참여
                         → 1:1 조정 전환
                         → 상대방 진술 작성
                         → AI 1:1 판결
→ 판결 결과 확인
→ 선물추천
```

---

## 3. MVP 포함 범위

```txt
카카오 로그인 / 약관 동의
AI 대화방 생성 / AI와 갈등 상황 정리
단독 판결 (혼자서 진행)
초대 링크 발급 / 상대방 참여 / 1:1 조정 전환
양측 진술 작성 / AI 판결 생성
판결 결과 확인 / 판결 결과 카드
사건기록 / 달력 / 감정일기
마이페이지 / 하단 탭
선물추천
통계 API / 홈·마이페이지 내 요약 통계 컴포넌트
```

---

## 4. MVP 제외 범위

```txt
shop / points / user-items
내부 결제
카카오톡 선물하기 직접 연동
외부 상품 API 직접 연동
statistics 독립 화면
관리자 페이지
푸시 알림
```

MVP 제외 항목은 구현하지 않는다. 필요 시 `docs/domains/*_FUTURE.md`에 정리한다.

---

## 5. 작성 카테고리

아래 4개만 사용한다.

```txt
연애 / 가족 / 친구 / 직장
```

아래 6개 구버전 카테고리는 사용하지 않는다.

```txt
관계 / 금전 / 공간 / 시간 / 가치관 / 역할
```

---

## 6. AI 판결 결과 기준

**포함:**

```txt
A/B 판결 점수
핵심 쟁점 요약
판결 근거
화해 제안
화해 메시지
선물추천 문구
16가지 세부 결과 유형 중 AI 도출 유형
```

**제외 (구현 금지):**

```txt
A/B 공감 지수
A/B 소통 태도 점수
```

결과 유형은 코드 Enum 하드코딩을 금지하고 DB 마스터 데이터 기준으로 관리한다.

---

## 7. 아키텍처 원칙

```txt
src/app/(page)    → 화면 라우트
src/app/api       → API Route Handler
src/domains       → 도메인별 비즈니스 로직, API client, hooks, constants
src/components    → 공통 UI / 레이아웃 / 피드백 컴포넌트
src/stores        → Zustand 기반 UI 상태
src/types         → 전역 타입
src/lib           → 공통 유틸, auth, api, db, ai, security, validators, constants
src/styles        → 전역 스타일, SCSS 변수, mixin
```

`features` 폴더는 사용하지 않는다.

---

## 8. 상태 전이 요약

### room_mode

```txt
ai_chat → invite_ready → one_to_one → closed / expired / deleted
```

### dispute_status

1:1 판결 경로:

```txt
draft → waiting_opponent → opponent_joined → both_submitted → judging → judged → closed / expired / deleted
```

단독 판결 경로:

```txt
draft → judging → judged → closed / expired / deleted
```

`jailed` 상태명은 사용하지 않는다. 상세 내용은 `docs/db/STATUS_TRANSITION.md` 참고.

---

## 9. 권한/보안 원칙

```txt
AI 대화방 조회:   creator_user_id 기준
1:1 사건 조회:    dispute_participants.user_id 기준
감정일기 조회:    emotion_diaries.user_id 기준
판결 결과 조회:   해당 dispute 참여자만 가능
```

```txt
room_token 원문은 DB 저장 금지 → room_token_hash만 저장
공유 이미지에 사건 원문 포함 금지
결과 카드에 개인정보 포함 금지
로그에 원문·개인정보 저장 금지
```

---

## 10. Supabase 인프라 확정

Supabase를 실제 사용 인프라로 확정한다.

**DB:**

```txt
Supabase Postgres 사용
Prisma는 Supabase Postgres의 DATABASE_URL을 통해 연결
```

**Storage:**

```txt
Supabase Storage 사용
MVP Storage 사용 범위는 result-cards bucket으로 제한
결과 카드 이미지 저장에 사용
정적 에셋(캐릭터, 아이콘, 결과카드 템플릿 등)은 public/images에서 관리
```

**Auth:**

```txt
Supabase Auth는 사용하지 않음
인증은 NextAuth + Kakao OAuth 유지
```

**보안:**

```txt
SUPABASE_SERVICE_ROLE_KEY는 서버 전용
클라이언트에서 Service Role Key 사용 금지
민감 원문(진술, 감정일기, AI 대화)은 Storage에 저장하지 않음
```

---

## 11. 문서 관리 원칙

```txt
도메인 상세 설계는 docs/domains/*.md에서 관리
루트 CLAUDE.md에는 상세 설계를 넣지 않음
도메인별 문서가 없으면 임의 구현하지 않음
```

---

## 12. Calendar UI 결정사항

**결정:** 달력 UI는 MUI X Date Pickers + Day.js 기반으로 구현한다.

**배경:**

```txt
- 날짜 선택 / 달력 마킹 UI를 자체 구현하면 복잡도가 높아진다.
- MUI X Date Pickers는 React + TypeScript 환경에서 안정적인 달력 UI를 제공한다.
- Day.js는 번들 크기가 작고 @mui/x-date-pickers 어댑터와 호환된다.
```

**적용 범위:**

```txt
- 달력 UI
- 날짜 선택 UI
- 날짜 기반 감정일기 / 사건기록 조회 UI
```

**제약:**

```txt
- 전체 디자인 시스템은 SCSS / SCSS Module을 유지한다.
- MUI는 달력 / 날짜 선택 UI 전용으로만 사용한다.
- MUI 컴포넌트는 src/components/calendar/ 내 래핑 컴포넌트를 통해서만 사용한다.
- 아이콘은 @mui/icons-material을 사용한다. 단, 감정일기(diary) 기능 내 아이콘은 lucide-react를 유지한다.
- 달력 라이브러리는 래핑 컴포넌트 구조로 교체 가능성을 확보한다.
```
