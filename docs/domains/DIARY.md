# DIARY Domain Document

> 작성자: TODO: 담당자 확인 필요
> 최종 수정일: 2026-06-15

---

## 1. 도메인 목적

감정일기 작성, 조회, 원문 보호를 담당한다.
작성자 본인만 조회 가능하며, 원문은 외부에 노출하지 않는다.

---

## 2. 담당자

```txt
FE: TODO: 담당자 확인 필요
BE: TODO: 담당자 확인 필요
```

---

## 3. 관련 기능 요구사항 ID

```txt
FR-DIARY-001
FR-DIARY-002
FR-DIARY-003
FR-DIARY-004
```

---

## 4. 관련 비기능 요구사항 ID

```txt
TODO: 비기능 요구사항 정의서 확인 후 작성
```

---

## 5. 포함 기능

```txt
- 날짜 기준 감정일기 작성
- 감정일기 조회 (본인만)
- 감정 키워드 / 감정 상태 (확장 가능성 확인 필요)
- 원문 보호
```

---

## 6. 제외 기능

```txt
- 감정일기 통계 화면 독립 노출 (MVP 제외)
- 감정일기 공유 이미지 생성 (금지)
- 외부 추천 기능에 원문 전달 (금지)
- 감정일기 원문 및 첨부 이미지 Supabase Storage 저장 (MVP 제외 — 추후 확장 시 별도 보안 정책 필요)
```

---

## 7. 관련 화면

```txt
src/app/page/diary/
src/app/page/calendar/   달력에서 일기 마킹 연계
```

---

## 8. 관련 API

```txt
POST  /api/v1/diaries          일기 작성
GET   /api/v1/diaries          일기 목록 조회
GET   /api/v1/diaries/:id      일기 상세 조회
PATCH /api/v1/diaries/:id      일기 수정
DELETE /api/v1/diaries/:id     일기 삭제
```

상세 스펙은 `docs/API_SPEC.md` 확정 후 작성.

---

## 9. 관련 테이블

```txt
emotion_diaries   감정일기 원문 및 감정 정보
```

상세 구조는 `docs/ERD.md` 및 `docs/db/PRISMA_MAPPING.md` 확정 후 작성.

---

## 10. 상태 전이

별도 상태 전이 없음.

---

## 11. 권한 규칙

```txt
감정일기 조회: emotion_diaries.user_id 기준
본인 일기만 접근 가능
타인 일기 접근 금지
```

---

## 12. UI 연결 지점

```txt
도메인 훅: src/domains/diary/
일기 화면: src/app/page/diary/
달력 연계: src/domains/calendar/ 와 마킹 연결
```

---

## 13. 예외 상황

```txt
- 같은 날짜에 중복 작성 가능 여부 확인 필요
- 감정 키워드 목록 마스터 데이터 관리 방식 확인 필요
```

---

## 14. Claude 작업 시 주의사항

```txt
- 감정일기 원문을 통계에 노출하지 않음
- 공유 이미지에 원문 포함 금지
- 외부 추천 기능에 원문 전달 금지
- 로그에 원문 저장 금지
- 감정일기 원문 및 첨부 이미지는 MVP에서 Supabase Storage 저장 대상이 아님
- 추후 첨부 이미지 기능 추가 시 별도 보안 정책(접근 권한, signed URL 등) 수립 필요
```
