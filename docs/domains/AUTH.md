# AUTH Domain Document

> 작성자: TODO: 담당자 확인 필요
> 최종 수정일: 2026-06-15

---

## 1. 도메인 목적

카카오 소셜 로그인, 약관 동의, 로그아웃, 회원탈퇴, 인증 상태 관리를 담당한다.
NextAuth 기반으로 카카오 OAuth를 처리하며, 세션 상태를 앱 전반에 제공한다.

---

## 2. 담당자

```txt
FE: TODO: 담당자 확인 필요
BE: TODO: 담당자 확인 필요
```

---

## 3. 관련 기능 요구사항 ID

```txt
FR-AUTH-001
FR-AUTH-002
FR-AUTH-003
FR-AUTH-005
FR-AUTH-006
```

---

## 4. 관련 비기능 요구사항 ID

```txt
TODO: 비기능 요구사항 정의서 확인 후 작성
```

---

## 5. 포함 기능

```txt
- 카카오 소셜 로그인
- 최초 로그인 시 약관 동의
- 로그아웃
- 로그인 상태 확인
- 회원탈퇴
```

---

## 6. 제외 기능

```txt
- 이메일 / 일반 로그인
- 카카오 외 다른 OAuth 제공자
- 관리자 로그인
```

---

## 7. 관련 화면

```txt
src/app/page/login/
src/app/page/terms/
```

---

## 8. 관련 API

```txt
GET  /api/auth/[...nextauth]   NextAuth 핸들러
POST /api/v1/auth/withdraw     회원탈퇴
```

상세 스펙은 `docs/API_SPEC.md` 확정 후 작성.

---

## 9. 관련 테이블

```txt
users   사용자 정보
```

상세 구조는 `docs/ERD.md` 및 `docs/db/PRISMA_MAPPING.md` 확정 후 작성.

---

## 10. 상태 전이

인증 상태는 NextAuth 세션 기준으로 관리한다.

```txt
비로그인 → 카카오 OAuth → 약관 동의 → 로그인 완료
로그인 완료 → 로그아웃 → 비로그인
로그인 완료 → 회원탈퇴 → 비식별 처리
```

---

## 11. 권한 규칙

```txt
로그인 페이지:    비인증 사용자만 접근
약관 동의 페이지: 최초 로그인 사용자만 접근
회원탈퇴:        본인만 가능
```

---

## 12. UI 연결 지점

```txt
세션 확인: src/lib/auth/
카카오 OAuth 설정: src/lib/auth/
```

---

## 13. 예외 상황

```txt
- 카카오 OAuth 실패 시 로그인 페이지로 리다이렉트
- 약관 미동의 상태로 접근 시 약관 동의 페이지로 강제 이동
- 탈퇴 처리 중 오류 시 롤백 처리 기준 확인 필요
```

---

## 14. Claude 작업 시 주의사항

```txt
- 실제 KAKAO_CLIENT_ID / KAKAO_CLIENT_SECRET 값 코드에 포함 금지
- NextAuth 상세 콜백 구현은 API_SPEC 확정 후 진행
- 환경변수는 docs/guides/ENV_GUIDE.md 기준 참조
- 카카오 OAuth 설정 변경은 팀 승인 필요 (CLAUDE.md 15항 참고)
```
