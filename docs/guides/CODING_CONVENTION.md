# CODING_CONVENTION.md

코딩 컨벤션 가이드

---

## 1. 언어 및 스타일

```txt
언어:   TypeScript (strict 모드)
스타일: SCSS Module (전역 스타일은 src/styles/)
포맷:   Prettier (.prettierrc 기준)
린트:   ESLint (eslint.config.mjs 기준)
```

---

## 2. 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| React 컴포넌트 | PascalCase | `RoomCard.tsx` |
| 함수 / 변수 | camelCase | `getRoomById`, `isLoading` |
| 파일명 (컴포넌트 외) | kebab-case | `room-service.ts`, `use-room.ts` |
| 상수 | UPPER_SNAKE_CASE | `MAX_ROOM_COUNT` |
| DB column | snake_case | `creator_user_id` |
| Prisma field | camelCase | `creatorUserId` |
| CSS class | kebab-case | `.room-card__title` |

---

## 3. 상태 관리 기준

**Zustand** — UI 상태만 담당

```txt
모달 / 바텀시트 / 플로팅 메뉴
선택 날짜 / 로딩 UI / 결과 카드 생성 중 상태
```

**TanStack Query** — 서버 데이터 담당

```txt
서버 조회 데이터 / 사건 상세 / 판결 결과
감정일기 목록 / 통계 데이터
```

서버 데이터는 Zustand에 저장하지 않는다.

---

## 4. 폴더 사용 기준

```txt
src/domains/*    도메인별 비즈니스 로직, API client, hooks, constants
src/components   공통 UI (ui / layout / feedback)
src/lib          공통 유틸, auth, api, db, ai, security, validators, constants
src/stores       Zustand UI 상태
src/types        전역 타입
src/styles       전역 SCSS 변수, mixin, base
```

---

## 5. 금지 구조

```txt
src/features
src/server
src/lib/types
src/lib/stores
src/domains/*/types
src/domains/*/stores
src/app/page/*/*.type.ts
src/app/page/*/*.store.ts
```

---

## 6. 보안 주의사항

```txt
console.log에 사건 원문 / 개인정보 출력 금지
API 응답에 불필요한 민감 정보 포함 금지
권한 검증은 반드시 서버에서 수행
클라이언트 단독 권한 검증 금지
```
