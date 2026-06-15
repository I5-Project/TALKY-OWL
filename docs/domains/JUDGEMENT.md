# JUDGEMENT Domain Document

> 작성자: TODO: 담당자 확인 필요
> 최종 수정일: 2026-06-15

---

## 1. 도메인 목적

AI 판결 생성, Gemini API 연동, 판결 결과 저장 및 조회를 담당한다.
양측 진술 완료 후 AI 판결을 생성하고, 결과를 카드 형태로 제공한다.

---

## 2. 담당자

```txt
FE: TODO: 담당자 확인 필요
BE: TODO: 담당자 확인 필요
```

---

## 3. 관련 기능 요구사항 ID

```txt
FR-AI-001
FR-AI-002
FR-AI-003
FR-AI-004
FR-AI-005
FR-RESULT-001
FR-RESULT-002
FR-RESULT-003
FR-RESULT-004
FR-CARD-001
FR-CARD-002
FR-CARD-003
```

---

## 4. 관련 비기능 요구사항 ID

```txt
TODO: 비기능 요구사항 정의서 확인 후 작성
```

---

## 5. 포함 기능

```txt
- AI 판결 생성 요청 (Gemini API)
- 판결 결과 저장
- 판결 결과 조회
- 판결 결과 카드 생성
- 결과 카드 이미지 추출 (html-to-image)
- 결과 카드 이미지 저장 (MVP에서는 서버 영구 저장 없이 html-to-image 클라이언트 추출 기준. Supabase Storage는 추후 확장)
- 16가지 세부 결과 유형 중 AI 도출 유형 표시
```

판결 결과 포함 항목:

```txt
- A/B 판결 점수
- 핵심 쟁점 요약
- 판결 근거
- 화해 제안
- 화해 메시지
- 결과 카드용 요약
- 선물추천 문구
- 세부 결과 유형 (DB 마스터 기준)
```

---

## 6. 제외 기능

```txt
- A/B 공감 지수 (구현 금지)
- A/B 소통 태도 점수 (구현 금지)
- 결과 유형 Enum 하드코딩 (구현 금지)
- 공유 이미지에 사건 원문 포함 (금지)
- 결과 카드에 개인정보 포함 (금지)
```

---

## 7. 관련 화면

```txt
src/app/page/disputes/   판결 결과 확인
```

---

## 8. 관련 API

```txt
POST /api/v1/disputes/:id/judge   AI 판결 요청
GET  /api/v1/disputes/:id/result  판결 결과 조회
```

상세 스펙은 `docs/API_SPEC.md` 확정 후 작성.

---

## 9. 관련 테이블

```txt
judgements             판결 결과
judgement_result_types 결과 유형 마스터 (Enum 대신 DB 관리)
```

상세 구조는 `docs/ERD.md` 및 `docs/db/PRISMA_MAPPING.md` 확정 후 작성.

---

## 10. 상태 전이

dispute_status = judging → judged 로 전환.
기준: `docs/db/STATUS_TRANSITION.md`

---

## 11. 권한 규칙

```txt
판결 결과 조회: 해당 dispute의 참여자(role_a / role_b)만 가능
타인 판결 결과 접근 금지
```

---

## 12. UI 연결 지점

```txt
도메인 훅:      src/domains/judgement/
AI 연동:        src/lib/ai/
결과 카드 추출: html-to-image 활용
결과 카드 저장: Supabase Storage result-cards bucket (서버 API Route를 통해 업로드)
```

### Storage 접근 원칙

```txt
- 결과 카드 이미지 업로드는 Next.js API Route를 통해 서버에서 처리한다.
- 클라이언트에서 SUPABASE_SERVICE_ROLE_KEY를 직접 사용하지 않는다.
- 공개 가능한 결과 카드는 public URL 또는 signed URL 정책을 구현 단계에서 확정한다.
- 결과 카드에 개인정보 및 사건 원문을 포함하지 않는다.
```

---

## 13. 예외 상황

```txt
- Gemini API 실패 → 구분 처리 필요 (API 오류 / JSON 파싱 실패 / timeout)
- AI 판결 생성 중복 요청 → 멱등성 처리 필요
- 판결 생성 중 상태(judging)에서 추가 요청 → 차단
```

---

## 14. Claude 작업 시 주의사항

```txt
- A/B 공감 지수 / 소통 태도 점수 구현 절대 금지
- 결과 유형 Enum 하드코딩 금지. DB 마스터 기준으로 관리 (docs/db/MASTER_DATA.md 참고)
- Gemini API 실패 / JSON 파싱 실패 / timeout 각각 구분 처리
- 공유 이미지에 사건 원문 포함 금지
- 결과 카드에 개인정보 포함 금지
- AI 판결 생성 요청 중복 방지 처리 필요
- Gemini API 프롬프트 구조 변경은 팀 승인 필요 (CLAUDE.md 15항 참고)
- 결과 카드 이미지 저장은 Supabase Storage result-cards bucket 사용
- Storage 업로드는 반드시 서버(API Route)를 통해 처리하며 클라이언트에서 직접 업로드 금지
- src/lib/supabase 또는 src/lib/storage 폴더 생성은 실제 구현 단계에서 진행
```
