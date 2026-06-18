# DISPUTE Domain Document

> 작성자: TODO: 담당자 확인 필요
> 최종 수정일: 2026-06-15

---

## 1. 도메인 목적

사건 생성, 참여자(role_a / role_b), 진술 작성, dispute_status 상태 관리를 담당한다.
방(room) 생성 시 dispute가 함께 생성되며, 진술 완료 후 혼자서 진행 또는 상대방 초대를 통해 AI 판결로 이어진다.

---

## 2. 담당자

```txt
FE: TODO: 담당자 확인 필요
BE: TODO: 담당자 확인 필요
```

---

## 3. 관련 기능 요구사항 ID

```txt
FR-INVITE-001
FR-INVITE-002
FR-INVITE-003
FR-INVITE-004
FR-INVITE-005
FR-INVITE-006
FR-STATEMENT-001
FR-STATEMENT-002
FR-STATEMENT-003
FR-STATEMENT-004
FR-STATEMENT-005
FR-CLOSE-001
FR-CLOSE-002
FR-DELETE-001
FR-DELETE-002
```

---

## 4. 관련 비기능 요구사항 ID

```txt
TODO: 비기능 요구사항 정의서 확인 후 작성
```

---

## 5. 포함 기능

```txt
- 방 생성 시 dispute 함께 생성 (dispute_status: draft)
- role_a 진술 작성 (먼저 작성)
- 진술저장 후 혼자서 진행 / 상대방 초대 선택
- 혼자서 진행: role_a 진술만으로 AI 단독 판결
- 상대방 초대: 초대 링크 발급 → role_b 참여 → role_b 진술 작성 → AI 1:1 판결
- 진술 수정 (진술저장 이후 사건조회에서 본인 진술 카드 클릭 시 가능)
- dispute_status 상태 관리
- 사건 종료 / 만료 / 삭제
- 비식별 처리
```

---

## 6. 제외 기능

```txt
- AI 대화방(room) 없이 바로 사건 생성 (금지)
- 동일 사용자의 role_a / role_b 동시 보유 (금지)
```

---

## 7. 관련 화면

```txt
src/app/(page)/disputes/[id]/          사건조회 (진술 탭 / 판결 탭 / 유형 탭)
src/app/(page)/disputes/[id]/statement 사건작성 (role_a / role_b 진술 작성, 수정)
src/app/(page)/join/                   초대 링크 참여 (role_b 진입)
```

판결 탭:
- 혼자서 진행(단독): 텍스트 판결결과만 제공 (프로필 사진 / 그래프 없음)
- 상대방 초대(1:1): 프로필 사진 + 그래프 + 텍스트 판결결과 제공

유형 탭:
- AI 도출 결과 유형 캐릭터 이미지 및 설명
- 공유하기 / 결과 다운받기 버튼

---

## 8. 관련 API

→ [`docs/API_SPEC.md`](../API_SPEC.md) §3, §4.5 참조

---

## 9. 관련 테이블

```txt
disputes               사건 정보, dispute_status
dispute_participants   참여자 (role_a / role_b)
dispute_statements     양측 진술
```

상세 구조는 `docs/ERD.md` 및 `docs/db/PRISMA_MAPPING.md` 확정 후 작성.

---

## 10. 상태 전이

기준: `docs/db/STATUS_TRANSITION.md`

단독 판결 경로:

```txt
draft
  │ role_a 진술 작성 후 단독 AI 판결 요청
  ▼
judging
  │ AI 판결 완료
  ▼
judged
  │ 종료 / 만료 / 삭제
  ▼
closed / expired / deleted
```

1:1 판결 경로:

```txt
draft
  │ role_a 진술 작성 후 초대 링크 발급
  ▼
waiting_opponent
  │ 상대방 참여
  ▼
opponent_joined
  │ 양측 진술 완료
  ▼
both_submitted
  │ AI 판결 요청
  ▼
judging
  │ AI 판결 완료
  ▼
judged
  │ 종료 / 만료 / 삭제
  ▼
closed / expired / deleted
```

---

## 11. 권한 규칙

```txt
사건 조회:    dispute_participants.user_id 기준
진술 작성:    본인 role 기준 (role_a 또는 role_b)
진술 종료:    본인 role 기준
사건 삭제:    TODO: 권한 기준 확정 필요
비식별 처리:  TODO: 권한 기준 확정 필요
```

---

## 12. UI 연결 지점

```txt
도메인 훅: src/domains/dispute/
참여 페이지: src/app/(page)/join/
사건 페이지: src/app/(page)/disputes/
```

---

## 13. 예외 상황

```txt
- 생성자 본인이 role_b로 참여 시도 → 차단
- 이미 role_b가 존재하는 방에 추가 참여 → 차단
- 만료된 초대 링크 접근 → 차단
- 진술 종료 중복 요청 → 멱등성 처리 필요
- AI 판결 생성 중복 요청 → 멱등성 처리 필요
```

---

## 14. Claude 작업 시 주의사항

```txt
- dispute는 room 생성 시 함께 생성. AI 대화방(room) 없이 바로 dispute 생성 금지
- role_a가 먼저 진술 작성 → 진술저장 → 혼자서 진행 or 상대방 초대 선택
- role_b는 초대 참여 후 별도로 진술 작성 (role_a와 동시 작성 아님)
- 진술 수정은 진술저장 이후 사건조회에서 본인 진술 카드 클릭으로 가능
- 1:1 전환 시 생성자를 role_a로 확정, 상대방을 role_b로 확정
- 동일 사용자가 role_a / role_b 동시 보유하는 로직 구현 금지
- 하나의 role에 진술 1개만 허용
- 진술 종료 / 초대 참여 / 삭제 요청은 중복 방지 처리 필요
- jailed 상태명 사용 금지
- 상태 전이 임의 변경 금지 (팀 승인 필요)
- 혼자서 진행(단독) 시: draft → judging → judged (waiting_opponent, opponent_joined, both_submitted 생략)
```
