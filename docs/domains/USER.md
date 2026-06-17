# USER Domain Document

> 작성자: TODO: 담당자 확인 필요
> 최종 수정일: 2026-06-15

---

## 1. 도메인 목적

사용자 정보, 마이페이지, 프로필 관리, 하단 탭 접근, 회원탈퇴 연결을 담당한다.

---

## 2. 담당자

```txt
FE: TODO: 담당자 확인 필요
BE: TODO: 담당자 확인 필요
```

---

## 3. 관련 기능 요구사항 ID

```txt
FR-MYPAGE-001
FR-MYPAGE-002
FR-NAV-001
FR-NAV-002
```

---

## 4. 관련 비기능 요구사항 ID

```txt
TODO: 비기능 요구사항 정의서 확인 후 작성
```

---

## 5. 포함 기능

```txt
- 마이페이지 조회
- 프로필 수정
- MBTI 선택 / 수정
- 하단 탭 접근
- 회원탈퇴 진입 (처리는 AUTH 도메인)
- 홈/마이페이지 내 요약 통계 컴포넌트 연결
```

---

## 6. 제외 기능

```txt
- 관리자 페이지 (MVP 제외)
- 푸시 알림 설정 (MVP 제외)
- 포인트 / 아이템 관리 (MVP 제외)
- 프로필 이미지 업로드 (MVP 필수 아님 — 추후 Supabase Storage 확장 대상으로 검토)
```

---

## 7. 관련 화면

```txt
src/app/(page)/mypage/
src/app/(page)/home/
```

---

## 8. 관련 API

→ [`docs/API_SPEC.md`](../API_SPEC.md) §3, §4.2 참조

---

## 9. 관련 테이블

```txt
users   사용자 정보
```

상세 구조는 `docs/ERD.md` 및 `docs/db/PRISMA_MAPPING.md` 확정 후 작성.

---

## 10. 상태 전이

별도 상태 전이 없음.

---

## 11. 권한 규칙

```txt
내 정보 조회/수정: 본인만 가능
타인 정보 접근 금지
```

---

## 12. UI 연결 지점

```txt
도메인 훅:        src/domains/user/
마이페이지:       src/app/(page)/mypage/
요약 통계 컴포넌트: src/components/ (STATISTICS 도메인 연계)
```

---

## 13. 예외 상황

```txt
- 프로필 이미지 업로드는 MVP 필수 아님. 추후 Supabase Storage 확장 시 별도 정책 수립 필요
- 회원탈퇴 처리 중 오류 시 롤백 기준 확인 필요
```

---

## 14. Claude 작업 시 주의사항

```txt
- 사용자 민감정보 최소 수집
- 프로필 이미지 업로드는 MVP 구현 금지. 추후 Supabase Storage 확장 단계에서 별도 브랜치로 진행
- 포인트 / 아이템 관련 로직 구현 금지
```
