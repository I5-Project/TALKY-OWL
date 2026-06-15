# ROOM Domain Document

> 작성자: TODO: 담당자 확인 필요
> 최종 수정일: 2026-06-15

---

## 1. 도메인 목적

AI 대화방 생성, AI 대화, 초대 링크 발급, room_mode 상태 관리를 담당한다.
모든 갈등 조정은 AI 대화방에서 시작하며, 상대방 초대 전까지 AI와의 갈등 정리 단계를 유지한다.

---

## 2. 담당자

```txt
FE: TODO: 담당자 확인 필요
BE: TODO: 담당자 확인 필요
```

---

## 3. 관련 기능 요구사항 ID

```txt
FR-ROOM-001
FR-ROOM-002
FR-ROOM-003
FR-ROOM-004
FR-ROOM-005
FR-ROOM-006
```

---

## 4. 관련 비기능 요구사항 ID

```txt
TODO: 비기능 요구사항 정의서 확인 후 작성
```

---

## 5. 포함 기능

```txt
- AI 대화방 생성 (카테고리 선택 포함)
- AI와 갈등 상황 정리 대화
- 초대 링크 발급
- room_mode 상태 관리
- 방 목록 / 사건기록 조회
- 방 종료 / 만료 / 삭제 처리
```

---

## 6. 제외 기능

```txt
- AI 대화방 없이 바로 1:1 사건 생성 (금지)
- AI 대화방 단계의 판결 점수 생성 (금지)
- 상대방 없는 단독 판결 (MVP 제외)
```

---

## 7. 관련 화면

```txt
src/app/(page)/home/
src/app/(page)/rooms/
src/app/(page)/join/
```

---

## 8. 관련 API

```txt
POST /api/v1/rooms             방 생성
GET  /api/v1/rooms             방 목록 조회
GET  /api/v1/rooms/:id         방 상세 조회
POST /api/v1/rooms/:id/invite  초대 링크 발급
POST /api/v1/rooms/:id/close   방 종료
DELETE /api/v1/rooms/:id       방 삭제
```

상세 스펙은 `docs/API_SPEC.md` 확정 후 작성.

---

## 9. 관련 테이블

```txt
dispute_rooms   방 정보, room_mode, room_token_hash
```

상세 구조는 `docs/ERD.md` 및 `docs/db/PRISMA_MAPPING.md` 확정 후 작성.

---

## 10. 상태 전이

기준: `docs/db/STATUS_TRANSITION.md`

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

---

## 11. 권한 규칙

```txt
방 조회: creator_user_id 기준 (ai_chat / invite_ready 단계)
1:1 이후 조회: dispute_participants.user_id 기준
초대 링크 접근: 만료 / 삭제 방 차단
생성자 본인 초대 링크 참여: 차단
이미 role_b 존재 시 추가 참여: 차단
```

---

## 12. UI 연결 지점

```txt
도메인 훅:  src/domains/room/
AI 대화 UI: src/app/(page)/rooms/
초대 참여:  src/app/(page)/join/
```

---

## 13. 예외 상황

```txt
- 만료된 초대 링크 접근 → 차단 및 안내 메시지
- 삭제된 방 접근 → 차단
- 생성자 본인이 초대 링크로 role_b 참여 시도 → 차단
- 이미 role_b가 존재하는 방에 추가 참여 시도 → 차단
- AI 대화 중 Gemini API 실패 → 재시도 / 오류 안내
```

---

## 14. Claude 작업 시 주의사항

```txt
- room_token 원문은 DB에 저장하지 않음. room_token_hash만 저장
- AI 대화방 단계에서 판결 점수 생성 로직 구현 금지
- AI 대화방 없이 바로 1:1 사건 생성 흐름 구현 금지
- 카테고리는 연애/가족/친구/직장 4개만 사용 (6개 구버전 금지)
- 상태 전이 임의 변경 금지 (팀 승인 필요)
```
