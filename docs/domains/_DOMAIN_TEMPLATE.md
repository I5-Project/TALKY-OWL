# [도메인명] Domain Document

> 작성자:
> 최종 수정일:

---

## 1. 도메인 목적

이 도메인이 담당하는 책임과 범위를 한 문단으로 요약한다.

---

## 2. 담당자

```txt
FE: 
BE: 
```

---

## 3. 관련 기능 요구사항 ID

```txt
FR-xxx
FR-xxx
```

---

## 4. 관련 비기능 요구사항 ID

```txt
NFR-xxx
```

---

## 5. 포함 기능

이 도메인에서 구현하는 기능 목록.

```txt
- 
- 
```

---

## 6. 제외 기능

MVP 제외이거나 이 도메인 범위 밖인 기능.

```txt
- 
- 
```

---

## 7. 관련 화면

```txt
src/app/(page)/[경로]
```

---

## 8. 관련 API

```txt
GET  /api/v1/[경로]
POST /api/v1/[경로]
```

상세 스펙은 `docs/API_SPEC.md` 참고.

---

## 9. 관련 테이블

```txt
테이블명 — 용도
```

상세 구조는 `docs/ERD.md` 및 `docs/db/PRISMA_MAPPING.md` 참고.

---

## 10. 상태 전이

해당 도메인에 상태 전이가 있는 경우 작성. 없으면 생략.

```txt
상태A → 상태B → 상태C
```

기준: `docs/db/STATUS_TRANSITION.md`

---

## 11. 권한 규칙

```txt
조회: 
수정: 
삭제: 
```

---

## 12. UI 연결 지점

```txt
공통 컴포넌트 사용: src/components/...
도메인 훅:         src/domains/[도메인]/hooks/...
```

---

## 13. 예외 상황

처리해야 할 예외 케이스 목록.

```txt
- 
- 
```

---

## 14. Claude 작업 시 주의사항

이 도메인 작업 시 Claude Code가 반드시 확인해야 할 사항.

```txt
- 
- 
```
