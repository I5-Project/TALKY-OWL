# CALENDAR Domain Document

> 작성자: TODO: 담당자 확인 필요
> 최종 수정일: 2026-06-15

---

## 1. 도메인 목적

달력 화면에서 날짜별 사건 기록, 감정 기록 마킹, 월별 요약을 담당한다.

---

## 2. 담당자

```txt
FE: TODO: 담당자 확인 필요
BE: TODO: 담당자 확인 필요
```

---

## 3. 관련 기능 요구사항 ID

```txt
FR-CALENDAR-001
FR-CALENDAR-002
FR-CALENDAR-003
FR-CALENDAR-004
```

---

## 4. 관련 비기능 요구사항 ID

```txt
TODO: 비기능 요구사항 정의서 확인 후 작성
```

---

## 5. 포함 기능

```txt
- 하단 탭 달력 접근
- 판결 기록 날짜 마킹
- 감정일기 작성 여부 마킹
- 월별 다툼 횟수 요약
```

---

## 6. 제외 기능

```txt
- 외부 캘린더 연동
- 이벤트 알림 / 푸시 알림 (MVP 제외)
```

---

## 7. 관련 화면

```txt
src/app/(page)/calendar/
```

---

## 8. 관련 API

→ [`docs/API_SPEC.md`](../API_SPEC.md) §3, §4.8 참조

---

## 9. 관련 테이블

```txt
disputes           판결 기록 날짜 참조
emotion_diaries    감정일기 작성 여부 참조
```

상세 구조는 `docs/ERD.md` 확정 후 작성.

---

## 10. 상태 전이

별도 상태 전이 없음.

---

## 11. 권한 규칙

```txt
달력 조회: 본인 데이터만 조회
타인 기록 접근 금지
```

---

## 12. UI 연결 지점

```txt
도메인 훅:  src/domains/calendar/
달력 화면:  src/app/(page)/calendar/
```

---

## 13. 예외 상황

```txt
- 감정일기 미작성 날짜 마킹 기준 확인 필요
- 해결 여부 필드 MVP 필수 여부 담당자 확인 필요
```

---

## 14. Calendar UI Library

달력 UI는 MUI X Date Pickers 기반으로 구현한다.

```txt
라이브러리:  @mui/x-date-pickers
날짜 어댑터: dayjs (@mui/x-date-pickers/AdapterDayjs)
```

사용 범위:

```txt
- 달력 UI
- 날짜 선택 UI
- 날짜 기반 감정일기 / 사건기록 조회 UI
```

구현 원칙:

```txt
- MUI 컴포넌트는 src/components/calendar/ 내 래핑 컴포넌트를 통해서만 사용한다.
- 여러 페이지 / 도메인에서 MUI 컴포넌트를 직접 import하지 않는다.
- 달력 마킹 데이터는 TanStack Query로 조회한다.
- 선택 날짜 상태는 Zustand로 관리한다.
- 전체 스타일 기준은 SCSS / SCSS Module을 유지한다.
- MUI는 달력 / 날짜 선택 UI 전용으로만 사용하며 전체 디자인 시스템에 적용하지 않는다.
```

---

## 15. Claude 작업 시 주의사항

```txt
- 감정일기는 사건과 직접 연결하지 않고 달력에서 독립 작성
- 외부 캘린더 연동 구현 금지
- 해결 여부 필드 MVP 필수 항목 여부 담당자 확인 필요
- MUI 컴포넌트를 달력 / 날짜 선택 이외 용도로 사용하지 않는다
- MUI 컴포넌트는 래핑 없이 페이지에서 직접 사용하지 않는다
```
