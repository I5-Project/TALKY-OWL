# API_SPEC.md

TALKY-OWL MVP API 명세서

> 작성일: 2026-06-17
> 기준 문서: CLAUDE.md, docs/PROJECT_DECISIONS.md, docs/domains/*.md, docs/db/STATUS_TRANSITION.md, prisma/schema.prisma

---

## 1. 문서 개요

### 목적

TALKY-OWL 서비스의 MVP API 엔드포인트를 정의하고, 요청/응답 구조, 인증 방식, 처리 정책, 에러 코드를 팀 공용 기준으로 문서화한다.

### 적용 범위

MVP 포함 기능에 한정한다. MVP 제외 기능(상점, 포인트, 단독 판결 등)은 이 문서에서 제거하거나 v2.0 예정으로 분리한다.

### Base URL

| 환경 | URL |
|------|-----|
| 로컬 | `http://localhost:3030` |
| 프로덕션 | `https://[프로덕션 도메인]` — 확정 필요 |

### 인증 방식

- **사용자 인증:** NextAuth 세션 쿠키 기반
- 서버에서 세션을 검증하며, 클라이언트 단독 인증 검증 금지 (CLAUDE.md §7)
- **Cron API:** `Authorization: Bearer {CRON_SECRET}` 헤더 기반

### MVP 포함/제외 범위

**포함:**
```
카카오 로그인 / 약관 동의
AI 대화방 생성 / AI 대화
초대 링크 발급 / 상대방 참여 / 1:1 조정 전환
양측 진술 작성 / AI 판결 생성
판결 결과 확인 / 판결 결과 카드 (html-to-image 클라이언트 생성)
사건기록 / 달력 / 감정일기
마이페이지 / 하단 탭
선물추천
통계 API / 홈·마이페이지 내 요약 통계 컴포넌트
```

**제외:**
```
상대방 없는 단독 판결
shop / points / user-items API
내부 결제
카카오톡 선물하기 직접 연동
외부 상품 API 직접 연동
statistics 독립 화면 API
관리자 API
푸시 알림 API
결과 카드 Supabase Storage 영구 저장 (추후 확장 예정)
```

---

## 2. 공통 규칙

### 공통 응답 구조

> 확정 필요: 아래 구조는 CLAUDE.md §10 기준 가이드라인 예시다. 팀 최종 확정 필요.

**성공 응답:**
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

**실패 응답:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 설명"
  }
}
```

### 공통 HTTP 상태 코드

| HTTP 상태 | 설명 |
|-----------|------|
| `200` | 성공 |
| `201` | 생성 성공 |
| `400` | 잘못된 요청 (유효성 검증 실패) |
| `401` | 인증 필요 (세션 없음 또는 만료) |
| `403` | 권한 없음 |
| `404` | 리소스 없음 |
| `409` | 충돌 (중복 요청 등) |
| `422` | 처리 불가 상태 (상태 전이 위반 등) |
| `500` | 서버 내부 오류 |

### 공통 에러 코드

> 확정 필요: 아래 에러 코드는 도메인 문서 기반 초안이다. 팀 최종 확정 필요.

| 코드 | HTTP | 설명 |
|------|------|------|
| `UNAUTHORIZED` | 401 | 인증 필요 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `CONFLICT` | 409 | 중복 요청 또는 이미 존재 |
| `INVALID_STATUS` | 422 | 허용되지 않는 상태 전이 |
| `VALIDATION_ERROR` | 400 | 요청 값 유효성 오류 |
| `INTERNAL_ERROR` | 500 | 서버 내부 오류 |
| `AI_FAILURE` | 500 | Gemini API 호출 실패 |
| `AI_PARSE_FAILURE` | 500 | Gemini 응답 JSON 파싱 실패 |
| `AI_TIMEOUT` | 500 | Gemini API 타임아웃 |

### 인증 표기 방식

- `🔒 인증 필요`: NextAuth 세션 쿠키 필요
- `🔑 Cron 인증`: `Authorization: Bearer {CRON_SECRET}` 헤더 필요
- `공개`: 인증 불필요

### 날짜/시간 포맷

> 확정 필요: ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`) 기준으로 제안하나 팀 확정 필요.

### ID 명명 규칙

- Path parameter: `{resourceId}` 형식 (예: `{roomId}`, `{disputeId}`)
- 모든 ID: UUID 형식

### Pagination

> 확정 필요: Pagination 방식(cursor / offset), 페이지 크기, 응답 구조 미확정.

---

## 3. API 목록 요약

### Auth / User

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| `GET/POST` | `/api/auth/[...nextauth]` | NextAuth 핸들러 (카카오 OAuth) | 공개 |
| `GET` | `/api/v1/users/me` | 내 정보 조회 | 🔒 |
| `PATCH` | `/api/v1/users/me` | 프로필 수정 | 🔒 |
| `POST` | `/api/v1/auth/withdraw` | 회원탈퇴 | 🔒 |

### Personal Analysis

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| — | `/api/v1/personal-analyses` | 개인 분석 (전체 확정 필요) | 🔒 |

### Room / Invite / AI Chat

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| `POST` | `/api/v1/rooms` | 방 생성 | 🔒 |
| `GET` | `/api/v1/rooms` | 방 목록 조회 | 🔒 |
| `GET` | `/api/v1/rooms/{roomId}` | 방 상세 조회 | 🔒 |
| `POST` | `/api/v1/rooms/{roomId}/invite` | 초대 링크 발급 | 🔒 |
| `POST` | `/api/v1/rooms/{roomId}/join` | 초대 링크로 참여 | 🔒 |
| `POST` | `/api/v1/rooms/{roomId}/close` | 방 종료 | 🔒 |
| `DELETE` | `/api/v1/rooms/{roomId}` | 방 삭제 | 🔒 |

### Dispute / Statement

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| `POST` | `/api/v1/disputes` | 사건 생성 (1:1 전환) | 🔒 |
| `GET` | `/api/v1/disputes/{disputeId}` | 사건 상세 조회 | 🔒 |
| `POST` | `/api/v1/disputes/{disputeId}/close` | 사건 종료 | 🔒 |
| `DELETE` | `/api/v1/disputes/{disputeId}` | 사건 삭제 | 🔒 |
| `POST` | `/api/v1/disputes/{disputeId}/statements` | 진술 작성/수정 | 🔒 |
| `POST` | `/api/v1/disputes/{disputeId}/statements/submit` | 진술 종료 | 🔒 |

### Judgement / Result Card

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| `POST` | `/api/v1/disputes/{disputeId}/judge` | AI 판결 요청 | 🔒 |
| `GET` | `/api/v1/disputes/{disputeId}/result` | 판결 결과 조회 | 🔒 |

### Diary

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| `POST` | `/api/v1/diary` | 일기 작성 | 🔒 |
| `GET` | `/api/v1/diary` | 일기 목록 조회 | 🔒 |
| `GET` | `/api/v1/diary/{diaryId}` | 일기 상세 조회 | 🔒 |
| `PATCH` | `/api/v1/diary/{diaryId}` | 일기 수정 | 🔒 |
| `DELETE` | `/api/v1/diary/{diaryId}` | 일기 삭제 | 🔒 |

> 확정 필요: 경로 `/api/v1/diary` (스캐폴딩 기준) vs `/api/v1/diaries` (DIARY.md 기준)

### Calendar

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| `GET` | `/api/v1/calendar` | 월별 기록 조회 | 🔒 |

### Statistics

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| `GET` | `/api/v1/statistics/summary` | 요약 통계 조회 | 🔒 |
| `GET` | `/api/v1/statistics/top-types` | 결과 유형 Top5 조회 | 🔒 |

### Gift Recommendation

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| `POST` | `/api/v1/disputes/{disputeId}/gift-recommendations` | 선물 추천 요청 (확정 필요) | 🔒 |
| `GET` | `/api/v1/disputes/{disputeId}/gift-recommendations` | 선물 추천 조회 (확정 필요) | 🔒 |

### Cron

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| `POST` | `/api/v1/cron/expire-invitations` | 초대 링크 만료 처리 (확정 필요) | 🔑 |
| `POST` | `/api/v1/cron/aggregate-statistics` | 통계 집계 (확정 필요) | 🔑 |
| `POST` | `/api/v1/cron/cleanup-drafts` | 미완성 사건 정리 (확정 필요) | 🔑 |

---

## 4. API 상세 명세

### 4.1 Auth

---

#### `GET/POST /api/auth/[...nextauth]`

- **인증:** 공개
- **설명:** NextAuth v4 카카오 OAuth 핸들러. 로그인, 콜백, 세션, 로그아웃을 처리한다.
- **처리 정책:**
  - 최초 로그인 시 `users` 테이블에 사용자 생성, 백엔드 랜덤 닉네임 부여
  - `kakaoId` 기반으로 기존 회원 식별
  - 카카오 OAuth 실패 시 로그인 페이지로 리다이렉트
  - 약관 미동의 사용자는 약관 동의 페이지로 강제 이동
- **확정 필요:**
  - 닉네임 자동 생성 패턴 및 길이
  - 약관 동의 여부 확인 기준 (`termsAgreedAt` vs `user_terms_agreements` 테이블 조회)
  - 세션에 포함할 커스텀 필드 범위 (`id`, `nickname`, `kakaoId` 등)

---

#### `POST /api/v1/auth/withdraw`

- **인증:** 🔒
- **설명:** 본인 계정 탈퇴. 비식별 처리 후 세션 무효화.
- **Request Body:**

```json
{
  "reason": "string (optional)"
}
```

- **Response 200:**

```json
{
  "success": true,
  "data": { "message": "탈퇴 처리가 완료되었습니다." },
  "error": null
}
```

- **Error Code:**

| 코드 | HTTP | 설명 |
|------|------|------|
| `UNAUTHORIZED` | 401 | 비인증 사용자 |
| `INTERNAL_ERROR` | 500 | 탈퇴 처리 중 오류 |

- **처리 정책:**
  - 본인만 가능
  - 멱등성 처리 필요 (CLAUDE.md §8)
  - 세션 무효화 후 응답
- **로그 정책:** `UserDeletionLog` 기록 (원문 없이 hash 및 메타만 저장)
- **확정 필요:**
  - 경로 최종 확정: `POST /api/v1/auth/withdraw` (AUTH.md) vs `DELETE /api/v1/users/me` (USER.md) 충돌
  - 탈퇴 처리 중 오류 시 롤백 기준
  - 비식별 처리 대상 필드 범위

---

### 4.2 User

---

#### `GET /api/v1/users/me`

- **인증:** 🔒
- **설명:** 로그인한 사용자의 프로필 정보를 조회한다.
- **Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nickname": "string",
    "profileImageUrl": "string | null",
    "gender": "male | female | other | unknown | no_answer | null",
    "ageGroup": "under_10 | teens | twenties | thirties | forties | fifties | sixties_plus | unknown | no_answer | null",
    "mbti": "string | null",
    "termsAgreedAt": "ISO8601 | null",
    "createdAt": "ISO8601"
  },
  "error": null
}
```

- **Error Code:**

| 코드 | HTTP | 설명 |
|------|------|------|
| `UNAUTHORIZED` | 401 | 비인증 사용자 |
| `NOT_FOUND` | 404 | 사용자 없음 |

- **처리 정책:**
  - 본인 정보만 조회 가능
  - `deletedAt`이 있는 탈퇴 계정 처리 기준 확정 필요
  - MVP에서 `profileImageUrl`은 카카오 프로필 이미지 URL 그대로 반환 (Supabase Storage 미사용)
- **확정 필요:**
  - 응답 필드 범위 최종 확정 (`kakaoId` 포함 여부 등)
  - 탈퇴 계정 응답 처리 기준 (404 vs 403)

---

#### `PATCH /api/v1/users/me`

- **인증:** 🔒
- **설명:** 사용자 프로필 정보를 수정한다.
- **Request Body:**

```json
{
  "nickname": "string (optional)",
  "gender": "male | female | other | no_answer (optional)",
  "ageGroup": "string (optional)",
  "mbti": "string (optional, 4자)"
}
```

- **Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nickname": "string",
    "gender": "string | null",
    "ageGroup": "string | null",
    "mbti": "string | null"
  },
  "error": null
}
```

- **Error Code:**

| 코드 | HTTP | 설명 |
|------|------|------|
| `UNAUTHORIZED` | 401 | 비인증 사용자 |
| `VALIDATION_ERROR` | 400 | 유효하지 않은 값 |

- **처리 정책:**
  - 본인만 수정 가능
  - MVP에서 프로필 이미지 업로드 불가 (Supabase Storage 미사용)
- **확정 필요:**
  - 수정 가능 필드 범위 최종 확정
  - nickname 중복 허용 여부

---

### 4.3 Personal Analysis

> **전체 확정 필요:** `PERSONAL_ANALYSIS.md §8`이 TODO 상태. API 경로 및 요청/응답 구조 미확정.

- **예상 Base Endpoint:** `/api/v1/personal-analyses`
- **연관 도메인:** ROOM 도메인과 연계 (`room_mode = ai_chat` 단계)
- **제약:**
  - AI 대화방 단계에서 판결 점수 생성 금지
  - 단독 판결 생성 금지 (MVP 제외)
  - 갈등 정리, 감정 정리, 대화 방향 조언만 제공
  - 조회 권한: `creator_user_id` 기준

---

### 4.4 Room / Invite / AI Chat

---

#### `POST /api/v1/rooms`

- **인증:** 🔒
- **설명:** AI 대화방을 생성한다. 모든 방은 `ai_chat` 모드로 시작한다.
- **Request Body:**

```json
{
  "categoryGroup": "romance | family | friend | work",
  "title": "string (optional)"
}
```

- **Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "roomNo": "string",
    "categoryGroup": "romance | family | friend | work",
    "roomMode": "ai_chat",
    "createdAt": "ISO8601"
  },
  "error": null
}
```

- **Error Code:**

| 코드 | HTTP | 설명 |
|------|------|------|
| `UNAUTHORIZED` | 401 | 비인증 사용자 |
| `VALIDATION_ERROR` | 400 | 유효하지 않은 카테고리 |

- **처리 정책:**
  - 카테고리는 `romance / family / friend / work` 4개만 허용 (6개 구버전 카테고리 금지)
  - 생성 시 `CalendarRecord` 생성 여부 확정 필요
- **로그 정책:** `AuditLog` — `ROOM_CREATED` 이벤트 기록

---

#### `GET /api/v1/rooms`

- **인증:** 🔒
- **설명:** 내가 생성하거나 참여한 방 목록을 조회한다.
- **Query Params:**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `roomMode` | string (optional) | room_mode 필터 |

- **Response 200:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "roomNo": "string",
        "categoryGroup": "string",
        "roomMode": "string",
        "createdAt": "ISO8601"
      }
    ]
  },
  "error": null
}
```

- **처리 정책:**
  - `ai_chat / invite_ready`: `creator_user_id` 기준 조회
  - `one_to_one` 이후: `dispute_participants.user_id` 기준 조회
  - `deleted` 상태 방 제외
- **확정 필요:**
  - Pagination 방식 및 구조
  - 정렬 기준

---

#### `GET /api/v1/rooms/{roomId}`

- **인증:** 🔒
- **설명:** 방 상세 정보를 조회한다.
- **Path Params:** `roomId` (UUID)
- **Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "roomNo": "string",
    "categoryGroup": "string",
    "roomMode": "string",
    "expiresAt": "ISO8601 | null",
    "createdAt": "ISO8601"
  },
  "error": null
}
```

- **Error Code:**

| 코드 | HTTP | 설명 |
|------|------|------|
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 방 없음 또는 deleted 상태 |

- **처리 정책:**
  - `ai_chat / invite_ready`: `creator_user_id` 기준
  - `one_to_one` 이후: `dispute_participants.user_id` 기준
  - `deleted` 상태 접근 차단

---

#### `POST /api/v1/rooms/{roomId}/invite`

- **인증:** 🔒
- **설명:** 초대 링크용 토큰을 발급하고 `room_mode`를 `invite_ready`로 전환한다.
- **Request Body:** 없음
- **Response 201:**

```json
{
  "success": true,
  "data": {
    "inviteUrl": "string",
    "expiresAt": "ISO8601"
  },
  "error": null
}
```

- **Error Code:**

| 코드 | HTTP | 설명 |
|------|------|------|
| `FORBIDDEN` | 403 | 생성자 아님 |
| `INVALID_STATUS` | 422 | ai_chat 상태가 아님 |

- **처리 정책:**
  - `room_token` 원문 DB 저장 금지, `room_token_hash`만 저장 (CLAUDE.md §7)
  - `room_mode` → `invite_ready` 전환
- **로그 정책:** `AuditLog` — `INVITE_LINK_CREATED` 기록
- **확정 필요:** 초대 링크 만료 시간 정책

---

#### `POST /api/v1/rooms/{roomId}/join`

- **인증:** 🔒
- **설명:** 초대 토큰 검증 후 상대방이 방에 참여한다. 성공 시 `room_mode` → `one_to_one`, `Dispute` 생성.
- **Request Body:**

```json
{
  "token": "string"
}
```

- **Response 200:**

```json
{
  "success": true,
  "data": {
    "roomId": "uuid",
    "disputeId": "uuid",
    "role": "role_b"
  },
  "error": null
}
```

- **Error Code:**

| 코드 | HTTP | 설명 |
|------|------|------|
| `FORBIDDEN` | 403 | 생성자 본인의 참여 시도 |
| `CONFLICT` | 409 | role_b 이미 존재 |
| `NOT_FOUND` | 404 | 유효하지 않은 토큰 |
| `INVALID_STATUS` | 422 | 만료 또는 삭제된 방 |

- **처리 정책:**
  - `room_token_hash` 검증
  - 만료된 초대 링크 차단
  - 생성자 본인 참여 차단
  - role_b 중복 참여 차단
  - 멱등성 처리 필요 (CLAUDE.md §8)
  - 참여 성공 시 `room_mode` → `one_to_one`, 생성자 `role_a` 확정, 참여자 `role_b` 확정
- **로그 정책:** `AuditLog` — `USER_JOINED_ROOM`, `RoomAccessLog` 기록

---

#### `POST /api/v1/rooms/{roomId}/close`

- **인증:** 🔒
- **설명:** 방을 종료 상태(`closed`)로 전환한다.
- **Response 200:**

```json
{
  "success": true,
  "data": { "roomMode": "closed" },
  "error": null
}
```

- **확정 필요:** 종료 가능 조건, 권한 기준 (생성자만 가능 여부)

---

#### `DELETE /api/v1/rooms/{roomId}`

- **인증:** 🔒
- **설명:** 방을 삭제 처리한다. Soft delete (`deletedAt` 기준).
- **확정 필요:** 삭제 가능 상태 조건, 권한 기준

---

### 4.5 Dispute / Statement

---

#### `POST /api/v1/disputes`

- **인증:** 🔒
- **설명:** 상대방 참여 완료 후 1:1 조정 사건을 생성한다. 생성자를 `role_a`로 확정한다.
- **Request Body:**

```json
{
  "roomId": "uuid",
  "title": "string",
  "description": "string (optional)"
}
```

- **Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "roomId": "uuid",
    "categoryGroup": "string",
    "title": "string",
    "status": "draft",
    "createdAt": "ISO8601"
  },
  "error": null
}
```

- **Error Code:**

| 코드 | HTTP | 설명 |
|------|------|------|
| `INVALID_STATUS` | 422 | room_mode가 one_to_one이 아님 |
| `CONFLICT` | 409 | 해당 roomId에 dispute 이미 존재 |

- **처리 정책:**
  - AI 대화방 없이 바로 사건 생성 금지 (CLAUDE.md §14)
  - `room_mode = one_to_one` 상태에서만 생성 가능
  - 생성자를 `role_a`로 확정
  - 동일 `roomId`에 dispute 중복 생성 불가

---

#### `GET /api/v1/disputes/{disputeId}`

- **인증:** 🔒
- **설명:** 사건 상세 정보를 조회한다.
- **Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "roomId": "uuid",
    "categoryGroup": "string",
    "title": "string",
    "description": "string | null",
    "status": "draft | waiting_opponent | opponent_joined | both_submitted | judging | judged | closed | expired | deleted",
    "participants": [
      { "role": "role_a", "userId": "uuid" },
      { "role": "role_b", "userId": "uuid" }
    ],
    "createdAt": "ISO8601"
  },
  "error": null
}
```

- **Error Code:**

| 코드 | HTTP | 설명 |
|------|------|------|
| `FORBIDDEN` | 403 | 참여자 아님 |
| `NOT_FOUND` | 404 | 사건 없음 또는 deleted 상태 |

- **처리 정책:** `dispute_participants.user_id` 기준 권한 검증

---

#### `POST /api/v1/disputes/{disputeId}/close`

- **인증:** 🔒
- **설명:** 사건을 종료 상태(`closed`)로 전환한다.
- **확정 필요:** 종료 가능 조건, 권한 기준

---

#### `DELETE /api/v1/disputes/{disputeId}`

- **인증:** 🔒
- **설명:** 사건을 삭제 처리한다.
- **처리 정책:** 멱등성 처리 필요 (CLAUDE.md §8)
- **확정 필요:**
  - 삭제 권한 기준 (`DISPUTE.md §11` — TODO로 명시됨)
  - 비식별 처리 범위 (`DISPUTE.md §11` — TODO로 명시됨)

---

#### `POST /api/v1/disputes/{disputeId}/statements`

- **인증:** 🔒
- **설명:** 본인 role 기준으로 진술을 작성하거나 수정한다. 진술 종료(`submit`) 이후 수정 불가.
- **Request Body:**

```json
{
  "content": "string"
}
```

- **Response 200/201:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "disputeId": "uuid",
    "role": "role_a | role_b",
    "content": "string",
    "submittedAt": null
  },
  "error": null
}
```

- **Error Code:**

| 코드 | HTTP | 설명 |
|------|------|------|
| `FORBIDDEN` | 403 | 참여자 아님 |
| `CONFLICT` | 409 | 이미 종료된 진술 수정 시도 |
| `INVALID_STATUS` | 422 | opponent_joined 상태가 아님 |

- **처리 정책:**
  - 본인 role 기준으로만 작성 가능
  - 진술 종료(`submittedAt` 설정) 이후 수정 불가
  - 하나의 role에 진술 1개만 허용
  - 욕설/부적절 표현 필터링 처리 (`moderationStatus` 반영)
- **로그 정책:** 필터링 결과 `ModerationLog` 기록 (원문 저장 금지)

---

#### `POST /api/v1/disputes/{disputeId}/statements/submit`

- **인증:** 🔒
- **설명:** 진술을 최종 제출한다. 제출 이후 수정 불가.
- **Request Body:** 없음
- **Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "submittedAt": "ISO8601",
    "disputeStatus": "both_submitted | opponent_joined"
  },
  "error": null
}
```

- **Error Code:**

| 코드 | HTTP | 설명 |
|------|------|------|
| `CONFLICT` | 409 | 이미 제출된 진술 |
| `NOT_FOUND` | 404 | 진술 없음 |

- **처리 정책:**
  - 멱등성 처리 필요 (CLAUDE.md §8)
  - 양측 제출 완료 시 `dispute_status` → `both_submitted`

---

### 4.6 Judgement / Result Card

---

#### `POST /api/v1/disputes/{disputeId}/judge`

- **인증:** 🔒
- **설명:** Gemini API를 호출하여 AI 판결을 생성한다. `dispute_status = both_submitted` 상태에서만 가능.
- **Request Body:** 없음
- **Response 201:**

```json
{
  "success": true,
  "data": {
    "judgementId": "uuid",
    "status": "judging"
  },
  "error": null
}
```

- **Error Code:**

| 코드 | HTTP | 설명 |
|------|------|------|
| `FORBIDDEN` | 403 | 참여자 아님 |
| `INVALID_STATUS` | 422 | both_submitted 상태 아님 |
| `CONFLICT` | 409 | 판결 이미 진행 중 또는 완료 |
| `AI_FAILURE` | 500 | Gemini API 호출 실패 |
| `AI_PARSE_FAILURE` | 500 | Gemini 응답 파싱 실패 |
| `AI_TIMEOUT` | 500 | Gemini API 타임아웃 |

- **처리 정책:**
  - `dispute_participants.user_id` 기준 권한 검증
  - 멱등성 처리 필요 (CLAUDE.md §8)
  - `judging` 상태에서 추가 요청 차단
  - 판결 완료 시 `dispute_status` → `judged`
  - Gemini 실패 / JSON 파싱 실패 / timeout 각각 구분 처리 (CLAUDE.md §10)
- **로그 정책:** `AuditLog` — `JUDGMENT_CREATED`, `ApiErrorLog` — AI 실패 시 기록
- **확정 필요:**
  - 경로 최종 확정: `/judge` (JUDGEMENT.md, 실제 라우트 파일 기준) vs `/judgement` (검토 메모)
  - Idempotency-Key 헤더 사용 여부

---

#### `GET /api/v1/disputes/{disputeId}/result`

- **인증:** 🔒
- **설명:** AI 판결 결과를 조회한다. 해당 dispute 참여자만 접근 가능.
- **Response 200:**

```json
{
  "success": true,
  "data": {
    "judgementId": "uuid",
    "verdictScoreA": 40,
    "verdictScoreB": 60,
    "moreResponsibleRole": "role_a | role_b | equal",
    "issueSummary": "string",
    "reasoning": "string",
    "advice": "string",
    "resultConflictGroup": {
      "id": "uuid",
      "groupCode": "string",
      "displayName": "string"
    },
    "resultConflictDetail": {
      "id": "uuid",
      "detailCode": "string",
      "displayName": "string"
    },
    "shareMessage": "string | null",
    "createdAt": "ISO8601"
  },
  "error": null
}
```

- **Error Code:**

| 코드 | HTTP | 설명 |
|------|------|------|
| `FORBIDDEN` | 403 | 참여자 아님 |
| `NOT_FOUND` | 404 | 판결 없음 |
| `INVALID_STATUS` | 422 | 판결 미완료 상태 |

- **처리 정책:**
  - `dispute_participants.user_id` 기준 권한 검증
  - **A/B 공감 지수, 소통 태도 점수 응답 포함 금지** (PROJECT_DECISIONS.md §6)
  - 결과 유형은 DB 마스터 기준 (`ConflictTypeGroup`, `ConflictTypeDetail`) — Enum 하드코딩 금지
  - 결과 카드는 `html-to-image` 기반 클라이언트 생성 (MVP에서 서버 영구 저장 없음)
  - 공유 이미지에 사건 원문 포함 금지 (CLAUDE.md §7)
- **확정 필요:**
  - 경로 최종 확정: `/result` (JUDGEMENT.md 기준) vs `/judgement` (검토 메모)
  - `resultCardSummary` 응답 포함 여부

---

### 4.7 Diary

> 확정 필요: 경로 `/api/v1/diary` (스캐폴딩 기준) vs `/api/v1/diaries` (DIARY.md 기준) 최종 확정 필요. 아래 명세는 현재 스캐폴딩 폴더 기준으로 작성.

---

#### `POST /api/v1/diary`

- **인증:** 🔒
- **설명:** 날짜 기준 감정일기를 작성한다.
- **Request Body:**

```json
{
  "diaryDate": "YYYY-MM-DD",
  "emotionType": "string (optional)",
  "content": "string"
}
```

- **Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "diaryDate": "YYYY-MM-DD",
    "emotionType": "string | null",
    "createdAt": "ISO8601"
  },
  "error": null
}
```

- **처리 정책:**
  - `emotion_diaries.user_id` 기준 본인만 작성 가능
  - 감정일기 원문을 통계, 공유 이미지, 외부 추천 기능에 노출 금지 (CLAUDE.md §7)
  - 로그에 원문 저장 금지
- **확정 필요:**
  - 같은 날짜 중복 작성 허용 여부 (DIARY.md §13 — TODO로 명시됨)
  - `emotionType` 허용 값 목록 (마스터 데이터 관리 방식 미확정)

---

#### `GET /api/v1/diary`

- **인증:** 🔒
- **설명:** 감정일기 목록을 조회한다.
- **Query Params:**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `year` | number (optional) | 연도 필터 |
| `month` | number (optional) | 월 필터 |
| `date` | `YYYY-MM-DD` (optional) | 특정 날짜 필터 |

- **Response 200:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "diaryDate": "YYYY-MM-DD",
        "emotionType": "string | null",
        "createdAt": "ISO8601"
      }
    ]
  },
  "error": null
}
```

- **처리 정책:** `emotion_diaries.user_id` 기준 본인 데이터만 조회
- **확정 필요:**
  - 목록 응답에 `content` 포함 여부
  - Pagination 방식

---

#### `GET /api/v1/diary/{diaryId}`

- **인증:** 🔒
- **Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "diaryDate": "YYYY-MM-DD",
    "emotionType": "string | null",
    "content": "string",
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  },
  "error": null
}
```

- **처리 정책:** 본인만 조회 가능 (`emotion_diaries.user_id` 기준)

---

#### `PATCH /api/v1/diary/{diaryId}`

- **인증:** 🔒
- **Request Body:**

```json
{
  "emotionType": "string (optional)",
  "content": "string (optional)"
}
```

- **처리 정책:** 본인만 수정 가능

---

#### `DELETE /api/v1/diary/{diaryId}`

- **인증:** 🔒
- **처리 정책:** 본인만 삭제 가능, Soft delete (`deletedAt` 기준)

---

### 4.8 Calendar

---

#### `GET /api/v1/calendar`

- **인증:** 🔒
- **설명:** 특정 월의 사건 기록, 감정일기 마킹 데이터를 조회한다.
- **Query Params:**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `year` | number | 확정 필요 | 조회 연도 |
| `month` | number | 확정 필요 | 조회 월 |

- **Response 200:**

```json
{
  "success": true,
  "data": {
    "year": 2026,
    "month": 6,
    "records": [
      {
        "date": "YYYY-MM-DD",
        "types": ["ai_chat_created", "emotion_diary"]
      }
    ]
  },
  "error": null
}
```

- **처리 정책:** 본인 데이터만 조회
- **확정 필요:**
  - Query param 형식: `year=&month=` vs `month=YYYY-MM` 최종 확정
  - 날짜별 마킹 타입 배열 구조 (`CalendarRecordType` Enum 기준)
  - 감정일기 미작성 날짜 마킹 기준

---

### 4.9 Statistics

---

#### `GET /api/v1/statistics/summary`

- **인증:** 🔒
- **설명:** 홈/마이페이지 요약 통계 컴포넌트에 노출할 익명 집계 데이터를 조회한다. Statistics 독립 화면은 MVP 제외이며 API만 제공한다.
- **Response 200:**

```json
{
  "success": true,
  "data": {
    "totalJudgements": 0,
    "myJudgements": 0
  },
  "error": null
}
```

- **처리 정책:**
  - 개인 식별 정보 포함 금지 (익명 집계)
  - 진술 원문, 감정일기 원문 포함 금지
- **확정 필요:** 응답 포함 집계 항목 범위 최종 확정

---

#### `GET /api/v1/statistics/top-types`

- **인증:** 🔒
- **설명:** 전체 판결 결과 유형 중 상위 5개를 조회한다.
- **Response 200:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "detailCode": "string",
        "displayName": "string",
        "count": 0
      }
    ]
  },
  "error": null
}
```

- **처리 정책:** 결과 유형은 DB 마스터 기준 (`ConflictTypeDetail`) — Enum 하드코딩 금지
- **확정 필요:**
  - 경로 최종 확정: `/top-types` (STATISTICS.md 기준) vs `/top5`
  - 집계 기준 및 쿼리 성능 정책

---

### 4.10 Gift Recommendation

> **전체 확정 필요:** `GIFT.md §8`이 TODO 상태. 아래는 검토 메모 기반 초안이며 팀 확정 필요.

- **예상 Endpoint:** `/api/v1/disputes/{disputeId}/gift-recommendations`
- **접근 조건:** `dispute_status = judged` 이후만 접근 가능
- **권한:** 해당 dispute 참여자만 접근 가능
- **제약:**
  - 갈등 원문을 외부 상품 검색 API에 전달 금지 (GIFT.md §14)
  - 내부 결제, 카카오톡 선물하기 직접 연동 금지 (MVP 제외)
  - 외부 상품 API 직접 연동 금지 (MVP 제외)
- **확정 필요:**
  - 전체 API 경로, 메서드, 요청/응답 구조
  - 나이대/성별 수집 방식 및 범위
  - Gemini 기반 추천 여부
  - 추천 아이템 수 (1~3개 수준, GIFT.md §5 기준)

---

### 4.11 Cron

> **전체 확정 필요:** 아래는 스캐폴딩 폴더 기준 초안이며 세부 처리 정책은 팀 확정 필요.

**공통 인증:** `Authorization: Bearer {CRON_SECRET}` 헤더

---

#### `POST /api/v1/cron/expire-invitations`

- **인증:** 🔑 Cron
- **설명:** 만료 시간이 지난 초대 링크를 일괄 처리한다.
- **확정 필요:** 처리 대상 조건, 응답 구조, 실행 주기

---

#### `POST /api/v1/cron/aggregate-statistics`

- **인증:** 🔑 Cron
- **설명:** 통계 데이터를 집계한다.
- **확정 필요:** 집계 대상, 응답 구조, 실행 주기

---

#### `POST /api/v1/cron/cleanup-drafts`

- **인증:** 🔑 Cron
- **설명:** 장기 미완성 사건을 정리한다.
- **확정 필요:** 정리 대상 조건 (기간 기준 등), 응답 구조, 실행 주기

---

## 5. Route Handler 구조

Next.js App Router 기준 디렉터리 트리.

```
src/app/api/
├── auth/
│   └── [...nextauth]/
│       └── route.ts
└── v1/
    ├── users/
    │   └── me/
    │       └── route.ts              # GET, PATCH
    ├── rooms/
    │   ├── route.ts                  # GET 목록, POST 생성
    │   └── [roomId]/
    │       ├── route.ts              # GET 상세, DELETE
    │       ├── invite/
    │       │   └── route.ts          # POST
    │       ├── join/
    │       │   └── route.ts          # POST
    │       └── close/
    │           └── route.ts          # POST
    ├── disputes/
    │   ├── route.ts                  # POST 생성
    │   └── [disputeId]/
    │       ├── route.ts              # GET 상세, DELETE
    │       ├── close/
    │       │   └── route.ts          # POST
    │       ├── statements/
    │       │   ├── route.ts          # POST 진술 작성
    │       │   └── submit/
    │       │       └── route.ts      # POST 진술 종료
    │       ├── judge/
    │       │   └── route.ts          # POST — 확정 필요: /judge vs /judgement
    │       ├── result/
    │       │   └── route.ts          # GET — 확정 필요: /result vs /judgement
    │       └── gift-recommendations/
    │           └── route.ts          # GET, POST — 확정 필요
    ├── diary/                        # ※ /diary vs /diaries 확정 필요
    │   ├── route.ts                  # GET 목록, POST 작성
    │   └── [diaryId]/
    │       └── route.ts              # GET 상세, PATCH, DELETE
    ├── calendar/
    │   └── route.ts                  # GET
    ├── statistics/
    │   ├── summary/
    │   │   └── route.ts              # GET
    │   └── top-types/
    │       └── route.ts              # GET — 확정 필요: /top-types vs /top5
    ├── personal-analyses/            # 전체 확정 필요
    │   └── route.ts
    ├── statements/                   # ※ disputes 하위로 통합 여부 확정 필요
    ├── auth/
    │   └── withdraw/
    │       └── route.ts              # POST — 확정 필요: 경로 충돌
    └── cron/
        ├── expire-invitations/
        │   └── route.ts
        ├── aggregate-statistics/
        │   └── route.ts
        └── cleanup-drafts/
            └── route.ts
```

---

## 6. 제거/변경된 API

### MVP에서 제거된 API

| 항목 | 이유 |
|------|------|
| `shop / points / user-items` 관련 API | MVP 제외 (v2.0 예정) |
| 단독 판결 API | MVP 제외 |
| 결과 카드 Supabase Storage 업로드 API | MVP에서 html-to-image 클라이언트 생성으로 대체 |
| 관리자 API | MVP 제외 |
| 푸시 알림 API | MVP 제외 |
| `statistics` 독립 화면 API | MVP 제외 (API는 유지, 독립 화면만 제외) |

### 경로 충돌 / 확정 필요 목록

| 항목 | 문서 A | 문서 B | 상태 |
|------|--------|--------|------|
| 회원탈퇴 경로 | `POST /api/v1/auth/withdraw` (AUTH.md) | `DELETE /api/v1/users/me` (USER.md) | **확정 필요** |
| 판결 요청 경로 | `/judge` (JUDGEMENT.md, 실제 라우트 파일) | `/judgement` (검토 메모) | **확정 필요** |
| 판결 결과 조회 경로 | `/result` (JUDGEMENT.md, 실제 라우트 파일) | `/judgement` (검토 메모) | **확정 필요** |
| 일기 API 경로 | `/api/v1/diary` (스캐폴딩) | `/api/v1/diaries` (DIARY.md) | **확정 필요** |
| 통계 Top 경로 | `/top-types` (STATISTICS.md) | `/top5` (검토 메모) | **확정 필요** |

---

## 7. 확정 필요 항목 모음

### 공통
- [ ] 공통 응답 구조 (`success / data / error`) 팀 최종 확정
- [ ] 날짜/시간 포맷 확정
- [ ] Pagination 방식(cursor / offset), 페이지 크기, 응답 구조

### Auth
- [ ] 회원탈퇴 경로: `POST /api/v1/auth/withdraw` vs `DELETE /api/v1/users/me`
- [ ] 닉네임 자동 생성 패턴 및 길이
- [ ] 약관 동의 여부 확인 기준 (`termsAgreedAt` vs `user_terms_agreements` 테이블)
- [ ] 세션 커스텀 필드 범위
- [ ] 탈퇴 비식별 처리 대상 필드 범위 및 롤백 기준

### User
- [ ] 응답 필드 범위 (`kakaoId` 포함 여부 등)
- [ ] 수정 가능 필드 범위
- [ ] nickname 중복 허용 여부
- [ ] 탈퇴 계정 응답 처리 기준 (404 vs 403)

### Room
- [ ] 초대 링크 만료 시간 정책
- [ ] 방 목록 Pagination 구조
- [ ] 방 종료/삭제 가능 조건 및 권한 기준

### Dispute
- [ ] 사건 삭제 권한 기준 (DISPUTE.md §11 — TODO)
- [ ] 비식별 처리 권한 기준 (DISPUTE.md §11 — TODO)
- [ ] 진술 목록 개별 조회 API 필요 여부

### Judgement
- [ ] 경로 최종 확정: `/judge` + `/result` vs `/judgement`
- [ ] Idempotency-Key 헤더 사용 여부
- [ ] `resultCardSummary` 응답 포함 여부

### Gift
- [ ] 전체 API 경로, 메서드, 요청/응답 구조 (GIFT.md §8 — TODO)
- [ ] Gemini 기반 추천 여부
- [ ] 나이대/성별 수집 방식

### Diary
- [ ] 경로 확정: `/api/v1/diary` vs `/api/v1/diaries`
- [ ] 같은 날짜 중복 작성 허용 여부 (DIARY.md §13 — TODO)
- [ ] `emotionType` 허용 값 목록 및 마스터 데이터 관리 방식
- [ ] 목록 조회 응답에 `content` 포함 여부

### Calendar
- [ ] Query param 형식: `year=&month=` vs `month=YYYY-MM`
- [ ] 날짜별 마킹 타입 배열 구조
- [ ] 감정일기 미작성 날짜 마킹 기준

### Statistics
- [ ] 경로 확정: `/top-types` vs `/top5`
- [ ] `summary` 응답 포함 집계 항목 범위

### Personal Analysis
- [ ] 전체 API 구조 미확정 (PERSONAL_ANALYSIS.md §8 — TODO)

### Cron
- [ ] 각 Cron API 처리 대상 조건, 응답 구조, 실행 주기

### Route 구조
- [ ] `src/app/api/v1/statements/` 폴더 — `disputes/{id}/statements` 하위로 통합 여부
- [ ] `src/app/api/v1/users/me` — 동적 라우트 vs 정적 `me` 세그먼트 처리 방식
