# STATISTICS Domain Document

> 작성자: TODO: 담당자 확인 필요
> 최종 수정일: 2026-06-15

---

## 1. 도메인 목적

전체 사용자 갈등 데이터 익명 집계, 통계 API, 홈/마이페이지 요약 통계 컴포넌트를 담당한다.
독립 화면은 MVP 제외이며, API와 컴포넌트 중심으로만 운영한다.

---

## 2. 담당자

```txt
FE: TODO: 담당자 확인 필요
BE: TODO: 담당자 확인 필요
```

---

## 3. 관련 기능 요구사항 ID

```txt
FR-STATS-001
FR-STATS-002
FR-STATS-003
```

---

## 4. 관련 비기능 요구사항 ID

```txt
TODO: 비기능 요구사항 정의서 확인 후 작성
```

---

## 5. 포함 기능

```txt
- 전체 사용자 갈등 데이터 익명화 집계
- 결과 유형 Top5 집계
- 홈 화면 내 요약 통계 컴포넌트
- 마이페이지 내 요약 통계 컴포넌트
- 통계 API
```

---

## 6. 제외 기능

```txt
- statistics 독립 화면 (MVP 제외)
- 개인 식별 정보 포함 통계
- 진술 원문 포함 통계
- 감정일기 원문 포함 통계
- Supabase Storage URL 포함 통계 (개인 식별 가능 정보로 간주)
```

---

## 7. 관련 화면

```txt
src/app/page/home/    홈 내 요약 통계 컴포넌트
src/app/page/mypage/  마이페이지 내 요약 통계 컴포넌트
```

독립 statistics 화면은 생성하지 않는다.

---

## 8. 관련 API

```txt
GET /api/v1/statistics/summary   요약 통계 조회
GET /api/v1/statistics/top-types 결과 유형 Top5 조회
```

상세 스펙은 `docs/API_SPEC.md` 확정 후 작성.

---

## 9. 관련 테이블

```txt
judgements             판결 집계 기준
judgement_result_types 결과 유형 마스터
```

상세 구조는 `docs/ERD.md` 확정 후 작성.

---

## 10. 상태 전이

별도 상태 전이 없음.

---

## 11. 권한 규칙

```txt
통계 API: 로그인 사용자 접근 가능
개인 식별 정보 없이 익명 집계만 제공
```

---

## 12. UI 연결 지점

```txt
도메인 훅:       src/domains/statistics/
홈 컴포넌트:     src/components/ 또는 src/app/page/home/
마이페이지 컴포넌트: src/app/page/mypage/
차트:            recharts 활용
```

---

## 13. 예외 상황

```txt
- 집계 데이터 없을 경우 빈 상태 UI 처리 필요
- 통계 집계 쿼리 성능 기준 확인 필요
```

---

## 14. Claude 작업 시 주의사항

```txt
- statistics 독립 화면 생성 금지
- 통계 데이터에 개인 식별 정보 포함 금지
- 진술 원문 / 감정일기 원문 통계에 저장 금지
- 결과 유형은 DB 마스터 기준으로 집계 (Enum 하드코딩 금지)
- Storage URL / 진술 원문 / 감정일기 원문 등 개인 식별 가능 정보 포함 금지
```
