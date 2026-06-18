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

## 2. SCSS import 규칙

SCSS 파일에서 `styles/abstracts`를 가져올 때는 반드시 `@/` 절대경로를 사용한다.

```scss
/* 올바른 예 */
@use '@/styles/abstracts/variables' as v;
@use '@/styles/abstracts/functions' as fn;
@use '@/styles/abstracts/mixins' as m;

/* 금지 */
@use '../../styles/abstracts/variables' as v;
@use '../../../../../styles/abstracts/functions' as fn;
```

상대경로(`../`)로 작성하지 않는다.
파일 이동 시 경로가 깨지는 것을 방지하고 일관성을 유지하기 위함이다.

---

## 3. 네이밍 규칙

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

## 4. 상태 관리 기준

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

## 5. 폴더 사용 기준

```txt
src/domains/*    도메인별 비즈니스 로직, API client, hooks, constants
src/components   공통 UI (ui / layout / feedback)
src/lib          공통 유틸, auth, api, db, ai, security, validators, constants
src/stores       Zustand UI 상태
src/types        전역 타입
src/styles       전역 SCSS 변수, mixin, base
```

---

## 6. 금지 구조

```txt
src/features
src/server
src/lib/types
src/lib/stores
src/domains/*/types
src/domains/*/stores
src/app/(page)/*/*.type.ts
src/app/(page)/*/*.store.ts
```

---

## 7. 보안 주의사항

```txt
console.log에 사건 원문 / 개인정보 출력 금지
API 응답에 불필요한 민감 정보 포함 금지
권한 검증은 반드시 서버에서 수행
클라이언트 단독 권한 검증 금지
```

---

## 8. MUI 사용 기준

MUI는 아래 허용 범위 내에서만 사용한다.

```txt
허용 범위:
  src/components/calendar/  → MUI X Date Pickers (달력 / 날짜 선택 UI)
  src/components/feedback/  → MUI Snackbar 등 (Toast 피드백 UI)
  @mui/icons-material       → 감정일기(diary) 기능 제외 전체 허용

금지 사항:
  - 감정일기(diary) 기능 내 아이콘은 lucide-react 사용 유지
  - 전체 디자인 시스템을 MUI 기반으로 전환하지 않는다
  - 여러 페이지 / 도메인에서 MUI 컴포넌트를 직접 import하지 않는다
  - MUI ThemeProvider를 앱 전역에 적용하지 않는다
```

스타일 기준:

```txt
- SCSS / SCSS Module 원칙을 유지한다
- MUI의 sx prop, styled() 사용은 래핑 컴포넌트 내부로 제한한다
- 전역 스타일에 MUI 의존 스타일을 추가하지 않는다
```

래핑 컴포넌트 원칙:

```txt
- MUI 컴포넌트는 각 허용 폴더 내 래핑 컴포넌트를 통해서만 사용한다
- 래핑 컴포넌트를 통해 라이브러리 교체 가능성을 유지한다
- 래핑 컴포넌트 외부에서는 MUI 직접 의존을 갖지 않는다
```
