# domains/README.md

도메인 문서 관리 안내

---

## 1. 목적

도메인별 상세 설계 문서를 관리한다.
루트 `CLAUDE.md`에는 도메인 상세 설계를 넣지 않는다.
Claude Code는 작업 전 해당 도메인 문서를 반드시 확인한다.

---

## 2. MVP 도메인

| 도메인 | 설명 |
|--------|------|
| `auth` | 카카오 로그인, 약관 동의 |
| `common` | 공통 유틸, 공유 컴포넌트 기반 |
| `room` | AI 대화방 생성, 초대 링크 |
| `personal-analysis` | 개인 갈등 분석 |
| `dispute` | 1:1 조정 사건 |
| `judgement` | AI 판결 생성 및 결과 |
| `gift` | 선물 추천 |
| `user` | 마이페이지, 사용자 정보 |
| `calendar` | 달력 |
| `diary` | 감정일기 |
| `statistics` | 요약 통계 API, 홈·마이페이지 통계 컴포넌트 |

`statistics`는 독립 화면이 아니다. MVP에서는 API 및 컴포넌트 중심으로만 사용한다.

---

## 3. v2.0 확장 예정 도메인

```txt
shop
points
user-items
```

MVP에서 구현하지 않는다.
필요 시 `docs/domains/*_FUTURE.md`에 정리한다.

---

## 4. 작성 원칙

```txt
각 담당자가 _DOMAIN_TEMPLATE.md를 기반으로 도메인 문서를 작성한다.
업무 분배표와 기능 요구사항 ID를 확인 후 작성한다.
도메인 문서가 없으면 Claude Code는 해당 도메인 로직을 임의 구현하지 않는다.
```

---

## 5. 파일 네이밍

```txt
docs/domains/ROOM.md
docs/domains/DISPUTE.md
docs/domains/JUDGEMENT.md
docs/domains/GIFT.md
docs/domains/USER.md
docs/domains/CALENDAR.md
docs/domains/DIARY.md
docs/domains/STATISTICS.md
```
