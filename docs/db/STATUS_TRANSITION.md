# STATUS_TRANSITION.md

상태 전이 정의 문서

---

## 1. room_mode

AI 대화방의 현재 모드를 나타낸다.

```txt
ai_chat
  │ 초대 링크 발급
  ▼
invite_ready
  │ 상대방 참여
  ▼
one_to_one
  │ 종료 / 만료 / 삭제
  ▼
closed / expired / deleted
```

| 상태 | 설명 |
|------|------|
| `ai_chat` | AI와 갈등 정리 단계. 판결 점수 생성 금지 |
| `invite_ready` | 초대 링크 발급 완료. 상대방 참여 대기 중 |
| `one_to_one` | 상대방 참여 완료. 양측 진술 작성 및 AI 판결 가능 |
| `closed` | 정상 종료 |
| `expired` | 만료 처리 |
| `deleted` | 삭제 처리 |

---

## 2. dispute_status

사건의 진행 상태를 나타낸다. 단독 판결과 1:1 판결의 경로가 다르다.

### 단독 판결 경로 (혼자서 진행)

```txt
draft
  │ role_a 진술 제출
  ▼
a_submitted
  │ 단독 AI 판결 요청
  ▼
judging
  │ AI 판결 완료
  ▼
judged
  │ 종료 / 만료 / 삭제
  ▼
closed / expired / deleted
```

### 1:1 판결 경로 (상대방 초대)

```txt
draft
  │ 초대 링크 발급
  ▼
waiting_opponent
  │ 상대방 참여
  ▼
opponent_joined
  │ role_a 진술 제출
  ▼
a_submitted
  │ role_b 진술 제출
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

| 상태 | 설명 |
|------|------|
| `draft` | 방(room) 생성 시 dispute 함께 생성. role_a 진술 작성 대기 단계 |
| `waiting_opponent` | 초대 링크 발급. 상대방 참여 대기 (1:1 전용) |
| `opponent_joined` | role_b 참여 완료. 양측 진술 작성 가능 (1:1 전용) |
| `a_submitted` | role_a 진술 제출 완료. 단독 판결 요청 가능 / 1:1에서는 role_b 진술 대기 |
| `both_submitted` | 양측 진술 완료. AI 판결 요청 가능 (1:1 전용) |
| `judging` | AI 판결 처리 중 (단독 / 1:1 공통) |
| `judged` | AI 판결 완료 (단독 / 1:1 공통) |
| `closed` | 정상 종료 |
| `expired` | 만료 처리 |
| `deleted` | 삭제 처리 |

---

## 3. 상태 변경 원칙

```txt
상태 변경은 서버에서 최종 검증한다.
클라이언트에서 임의로 상태를 변경하지 않는다.
임의 상태 점프 금지 (예: ai_chat → one_to_one 직접 전환 불가)
상태 변경 시 권한 검증 필수
```

---

## 4. 금지 상태명

```txt
jailed — 사용하지 않는다.
```

---

## 5. 상태 전이 변경 기준

상태 전이 규칙 변경이 필요한 경우 반드시 팀 승인 후 진행한다.
임의로 변경하지 않는다.
