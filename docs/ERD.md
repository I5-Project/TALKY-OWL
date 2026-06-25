# AI 갈등 조정 판결 서비스 ERD v2.7

> Prisma schema 실제 구현 기준을 반영한 ERD 업데이트본이다.
> 
> 본 문서는 `랜딩/로그인 → 카카오 인증 → 백엔드 랜덤 닉네임 부여 → AI-사용자 대화방 선생성 → 초대 링크 발급 → 상대방 참여 → 1:1 조정 → AI 판결 → 로그/삭제 보존` 흐름을 기준으로 한다.
> 

---

## 최신 통합 합의 기준

| 항목 | 최종 기준 |
| --- | --- |
| 작성 카테고리 | `연애 / 가족 / 친구 / 직장` 4개 |
| 화면 진입 | `랜딩 페이지 → 로그인 페이지 → 카카오 로그인 → 약관 동의 → 홈` 흐름 사용 |
| 방 생성 흐름 | 모든 방은 먼저 `AI-사용자 대화방`으로 생성 후, 초대 링크 발급 및 상대방 참여 시 `1:1 조정`으로 전환 |
| 개인 이용 모드 | MVP 포함. 단독 판결이 아니라 개인 갈등 상황 정리·분석·조언 기능 |
| AI 판결 결과 점수 | `A/B 판결 점수`만 제공. `공감 지수`, `소통 태도 점수` 제거 |
| 결과 유형 | 세부 결과 유형은 `conflict_type_details` 마스터 테이블로 관리. 상위 그룹 테이블(`conflict_type_groups`)은 현재 미구현 |
| 랜덤 닉네임 | 최초 로그인/회원 생성 시 백엔드에서 랜덤 닉네임 생성 후 User에 저장하고 프론트에는 API/세션으로 전달 |
| 통계 | 독립 statistics 화면은 MVP 제외. API는 유지하고 홈/마이페이지 일부 섹션에서 노출 |
| 상점/포인트 | MVP 제외, 추후 개발 예정 기능으로 이동 |
| 이미지 저장 | `media_assets` 테이블 구현 완료. Supabase Storage 기반 프로필/결과카드 이미지 관리 |
| 운영/모니터링 | Sentry는 MVP 이후 검토. MVP는 try-catch 공통 에러 핸들러, Vercel Logs, DB 로그 중심 |
| 로그 정책 | 방 생성, 초대 발급/접근/참여, AI 요청, 판결 생성, 회원탈퇴/사용자 삭제/비식별, API 오류, moderation 결과는 DB 로그로 남김 |
| 선물추천 | 판결 후 양측 사용자 프로필(성별/연령/MBTI) 기반 선물 추천. `gift_recommendations` + `gift_recommendation_items`로 관리 |

---

# 1. ERD 설계 원칙

- 모든 사용자는 카카오 로그인 기반 `users.id`로 식별한다.
- NextAuth Prisma Adapter 사용 시 `accounts` 테이블을 함께 사용한다. `sessions` 테이블은 JWT 전략 사용으로 제거되었다.
- 최초 사용자 생성 시 백엔드에서 랜덤 닉네임을 생성해 `users.nickname`에 저장한다.
- 개인 이용 모드는 `chat_sessions` / `chat_messages`로 관리한다. 기존 `personal_analyses`는 제거되었다.
- 모든 방은 `dispute_rooms`에서 시작한다.
- 방 생성 직후에는 `room_mode = ai_room` 상태다.
- 초대 링크 발급 시 `room_mode = invite_ready` 상태로 변경한다.
- 상대방이 참여하면 `room_mode = one_to_one` 상태로 변경하고 1:1 사건을 생성하거나 활성화한다.
- DB에는 `room_token` 원문을 저장하지 않고 `room_token_hash`만 저장한다.
- 결과 페이지에는 공감 지수와 소통 태도 점수를 저장하거나 표시하지 않는다.
- 판결 결과에는 A/B 판결 점수, 핵심 쟁점, A/B별 잘못한 점, A/B별 제안 대사, 결과 유형을 저장한다.
- 결과 유형은 Enum 하드코딩이 아니라 `conflict_type_details` 마스터 테이블로 관리한다.
- 감정일기는 사건과 독립적으로 작성할 수 있다.
- 상점, 포인트, 유저 아이템 테이블은 MVP에서 제외한다.
- 이미지 저장용 `media_assets` 테이블이 구현되었다. 프로필 이미지 및 결과 카드 이미지를 관리한다.
- 운영 로그에는 민감 원문을 저장하지 않는다.
- 사용자 삭제 로그는 `audit_logs`로 통합 관리한다. 별도 `user_deletion_logs` 테이블은 현재 미구현이다.

---

# 2. 전체 서비스 흐름

```
랜딩 페이지
→ 로그인 페이지
→ 카카오 로그인
→ 최초 사용자 약관 동의
→ 백엔드 랜덤 닉네임 부여
→ 개인 분석 작성 또는 방 생성
→ 방 생성 시 AI-사용자 대화방 생성
→ AI와 갈등 상황 정리
→ 초대 링크 발급
→ 상대방 링크 접속
→ 상대방 카카오 로그인
→ 상대방 참여
→ 1:1 조정 상태 전환
→ 양측 진술 작성
→ 양측 진술 제출 완료
→ AI 판결 생성
→ 결과 페이지 출력
→ 결과 카드 공유 / 화해 제안 / 선물 추천
→ 주요 이벤트 DB 로그 기록
```

---

# 3. Enum / 코드 기준

## 3.1 category_group

| Enum 값 | DB 매핑 값 | 화면 표시 | 설명 |
| --- | --- | --- | --- |
| `ROMANCE` | `romance` | 연애 | 연인, 썸, 이별, 연락, 애정 표현 갈등 |
| `FAMILY` | `family` | 가족 | 부모, 형제, 배우자, 가족 내 역할 갈등 |
| `FRIEND` | `friend` | 친구 | 친구 관계, 약속, 서운함, 거리감 갈등 |
| `WORK` | `work` | 직장 | 회사, 팀원, 상사, 업무 분담, 조직 내 갈등 |

## 3.2 room_mode

| Prisma 값 | DB 매핑 값 | 의미 |
| --- | --- | --- |
| `AI_ROOM` | `ai_room` | AI와 사용자 간 대화 상태 |
| `INVITE_READY` | `invite_ready` | 초대 링크가 발급된 상태 |
| `ONE_TO_ONE` | `one_to_one` | 상대방이 참여하여 1:1 조정 중 |
| `CLOSED` | `closed` | 방 종료 |
| `EXPIRED` | `expired` | 초대 링크 또는 방 만료 |
| `DELETED` | `deleted` | 삭제 또는 비식별 처리 |

> v2.6에서 사용하던 `ai_chat`은 `ai_room`으로 변경되었다.

## 3.3 dispute_status

| Prisma 값 | DB 매핑 값 | 의미 |
| --- | --- | --- |
| `DRAFT` | `draft` | 1:1 사건 생성 준비 |
| `WAITING_OPPONENT` | `waiting_opponent` | 상대방 대기 중 |
| `OPPONENT_JOINED` | `opponent_joined` | 상대방 참여 완료 |
| `BOTH_SUBMITTED` | `both_submitted` | 양측 진술 제출 완료 |
| `JUDGING` | `judging` | AI 판결 생성 중 |
| `JUDGED` | `judged` | AI 판결 완료 |
| `CLOSED` | `closed` | 사건 종료 |
| `EXPIRED` | `expired` | 상대방 미참여로 만료 |
| `DELETED` | `deleted` | 삭제 또는 비식별 처리 |

## 3.4 participant_role

| Prisma 값 | DB 매핑 값 | 의미 |
| --- | --- | --- |
| `ROLE_A` | `role_a` | A측 참여자 (생성자) |
| `ROLE_B` | `role_b` | B측 참여자 (상대방) |

> v2.6에서 사용하던 `side`(A/B) + `role`(creator/opponent) 이중 체계는 `participant_role` 단일 Enum으로 통합되었다.

## 3.5 responsible_role

| Prisma 값 | DB 매핑 값 | 의미 |
| --- | --- | --- |
| `ROLE_A` | `role_a` | A측 책임 |
| `ROLE_B` | `role_b` | B측 책임 |
| `EQUAL` | `equal` | 동등 책임 |

> v2.6에서 사용하던 `BOTH`, `NONE`은 `EQUAL`로 통합되었다.

## 3.6 room_ai_conversation_status

| Prisma 값 | DB 매핑 값 | 의미 |
| --- | --- | --- |
| `ACTIVE` | `active` | 진행 중 |
| `ANALYZED` | `analyzed` | 분석 완료 |
| `ARCHIVED` | `archived` | 보관 처리 |
| `DELETED` | `deleted` | 삭제 처리 |

> v2.6에서 사용하던 `completed`는 `ANALYZED`로 변경되었다.

## 3.7 message_sender_type

| Prisma 값 | DB 매핑 값 | 의미 |
| --- | --- | --- |
| `USER` | `user` | 사용자 메시지 |
| `AI` | `ai` | AI 메시지 |
| `SYSTEM` | `system` | 시스템 메시지 |

> v2.6에서 사용하던 `role`(user/assistant/system)은 `sender_type`(user/ai/system)으로 변경되었다.

## 3.8 terms_type

| Prisma 값 | DB 매핑 값 | 의미 |
| --- | --- | --- |
| `SERVICE` | `service` | 서비스 이용약관 |
| `PRIVACY` | `privacy` | 개인정보 처리방침 |
| `AI_NOTICE` | `ai_notice` | AI 관련 고지 |
| `MARKETING` | `marketing` | 마케팅 동의 |
| `GIFT_RECOMMENDATION_NOTICE` | `gift_recommendation_notice` | 선물추천 정보 수집 동의 |

## 3.9 user_gender

| Prisma 값 | DB 매핑 값 | 의미 |
| --- | --- | --- |
| `MALE` | `male` | 남성 |
| `FEMALE` | `female` | 여성 |
| `OTHER` | `other` | 기타 |
| `UNKNOWN` | `unknown` | 미확인 |
| `NO_ANSWER` | `no_answer` | 응답 거부 |

## 3.10 age_group

| Prisma 값 | DB 매핑 값 | 의미 |
| --- | --- | --- |
| `UNDER_10` | `under_10` | 10세 미만 |
| `TEENS` | `teens` | 10대 |
| `TWENTIES` | `twenties` | 20대 |
| `THIRTIES` | `thirties` | 30대 |
| `FORTIES` | `forties` | 40대 |
| `FIFTIES` | `fifties` | 50대 |
| `SIXTIES_PLUS` | `sixties_plus` | 60대 이상 |
| `UNKNOWN` | `unknown` | 미확인 |
| `NO_ANSWER` | `no_answer` | 응답 거부 |

## 3.11 media_asset_type

| Prisma 값 | DB 매핑 값 | 의미 |
| --- | --- | --- |
| `PROFILE` | `profile` | 프로필 이미지 |
| `RESULT_CARD` | `result_card` | 결과 카드 이미지 |
| `CHARACTER` | `character` | 캐릭터 이미지 |
| `SYSTEM` | `system` | 시스템 이미지 |

## 3.12 card_image_status

| Prisma 값 | DB 매핑 값 | 의미 |
| --- | --- | --- |
| `PENDING` | `pending` | 생성 대기 |
| `GENERATED` | `generated` | 생성 완료 |
| `FAILED` | `failed` | 생성 실패 |

## 3.13 gift_recommendation_status

| Prisma 값 | DB 매핑 값 | 의미 |
| --- | --- | --- |
| `PENDING` | `pending` | 추천 대기 |
| `GENERATED` | `generated` | 추천 완료 |
| `FAILED` | `failed` | 추천 실패 |

## 3.14 recipient_profile_source

| Prisma 값 | DB 매핑 값 | 의미 |
| --- | --- | --- |
| `USER_PROFILE` | `user_profile` | 사용자 프로필 기반 |
| `MANUAL_INPUT` | `manual_input` | 수동 입력 기반 |
| `MIXED` | `mixed` | 혼합 |

## 3.15 moderation_target

| Prisma 값 | DB 매핑 값 | 의미 |
| --- | --- | --- |
| `AI_MESSAGE` | `ai_message` | AI 대화 메시지 |
| `STATEMENT` | `statement` | 진술 내용 |
| `CARD_TEXT` | `card_text` | 결과 카드 텍스트 |

## 3.16 access_result

| Prisma 값 | DB 매핑 값 | 의미 |
| --- | --- | --- |
| `ALLOWED` | `allowed` | 접근 허용 |
| `DENIED` | `denied` | 접근 차단 |

## 3.17 audit_event_type

| 값 | 설명 |
| --- | --- |
| `ROOM_CREATED` | AI 대화방 생성 |
| `INVITE_LINK_CREATED` | 초대 링크 발급 |
| `USER_JOINED_ROOM` | 상대방 참여 성공 |
| `AI_MESSAGE_CREATED` | AI 대화 메시지 생성 |
| `STATEMENT_SUBMITTED` | 진술 제출 |
| `JUDGMENT_CREATED` | AI 판결 생성 완료 |
| `RESULT_CARD_CREATED` | 결과 카드 생성 |
| `GIFT_RECOMMENDATION_CREATED` | 선물 추천 생성 |
| `USER_DELETION_REQUESTED` | 회원탈퇴 요청 |
| `USER_DELETED` | 사용자 삭제 처리 |
| `USER_ANONYMIZED` | 사용자 비식별 처리 |
| `USER_REACTIVATED` | 사용자 재활성화 |
| `API_ERROR` | API 오류 |
| `MODERATION_FLAGGED` | moderation 감지 |

> v2.6 대비 변경: `JUDGEMENT_REQUESTED` 제거, `JUDGMENT_CREATED`/`RESULT_CARD_CREATED`/`GIFT_RECOMMENDATION_CREATED`/`USER_REACTIVATED` 추가. `INVITE_LINK_ACCESSED`/`INVITE_LINK_DENIED`는 `room_access_logs`에서 관리.

## 3.18 http_method

| 값 | 설명 |
| --- | --- |
| `GET` | GET 요청 |
| `POST` | POST 요청 |
| `PATCH` | PATCH 요청 |
| `PUT` | PUT 요청 |
| `DELETE` | DELETE 요청 |

## 3.19 미사용 Enum (Prisma에 정의만 존재, 테이블 미연결)

아래 Enum은 Prisma schema에 정의되어 있으나 현재 모델에 연결되지 않은 상태다. 향후 해당 테이블 구현 시 사용 예정이다.

| Enum | 용도 |
| --- | --- |
| `ai_error_type` | AI 요청 에러 유형 (timeout/json_parse/model_error/network_error/unknown) |
| `ai_log_type` | AI 로그 유형 (ai_room/judgement) |
| `deletion_type` | 삭제 유형 (soft_delete/anonymize/hard_delete) |
| `point_transaction_type` | 포인트 거래 유형 (MVP 제외) |
| `request_status` | 요청 상태 (pending/success/failed/timeout/parse_failed) |
| `shop_item_type` | 상점 아이템 유형 (MVP 제외) |
| `statistics_source_type` | 통계 소스 유형 (ai_room/one_to_one_judgement/combined) |

---

# 4. 주요 테이블 관계 요약

```
users
  ├── accounts (NextAuth OAuth 연결)
  ├── user_terms_agreements
  ├── chat_sessions → chat_messages (개인 분석/채팅)
  ├── dispute_rooms.creator_user_id
  ├── room_ai_conversations.user_id
  ├── room_ai_messages.user_id
  ├── dispute_participants.user_id
  ├── dispute_statements.user_id
  ├── emotion_diaries.user_id
  ├── gift_recommendations (sender / receiver)
  ├── media_assets.owner_user_id
  └── media_assets (profile_media_asset_id → 프로필 이미지)

dispute_rooms
  ├── room_ai_conversations
  ├── room_ai_messages
  ├── disputes (1:1 관계)
  └── room_access_logs

room_ai_conversations
  └── room_ai_messages
  └── disputes.source_conversation_id

disputes
  ├── dispute_participants
  ├── dispute_statements
  ├── ai_judgements (1:1 관계)
  └── gift_recommendations

ai_judgements
  ├── judgement_result_cards (1:1 관계)
  ├── ai_result_notices
  ├── conflict_type_details
  └── gift_recommendations

media_assets
  ├── judgement_result_cards.image_asset_id
  └── users.profile_media_asset_id

독립 로그 테이블
  ├── audit_logs (공통 감사 로그)
  ├── room_access_logs (초대 링크 접근 로그)
  ├── moderation_logs (콘텐츠 검열 로그)
  └── api_error_logs (API 에러 로그)
```

---

# 5. 테이블 정의

## 5.1 users

사용자 기본 정보를 저장한다. NextAuth User 모델과 서비스 프로필 필드를 함께 가진다.

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 사용자 ID |
| name | varchar | Y |  | NextAuth 기본 이름 |
| email | varchar | Y | UNIQUE | 이메일 |
| email_verified | datetime | Y |  | 이메일 검증 시각 |
| image | text | Y |  | NextAuth 기본 프로필 이미지 |
| kakao_id | varchar(100) | Y | UNIQUE | 카카오 사용자 식별값 |
| nickname | varchar(100) | Y |  | 서비스 표시 닉네임. 최초 생성 시 백엔드 랜덤 부여 |
| profile_image_url | text | Y |  | 카카오 프로필 이미지 또는 기본 이미지 경로 |
| profile_media_asset_id | uuid | Y | FK media_assets.id | 프로필 이미지 에셋 연결 |
| gender | enum(user_gender) | Y |  | 사용자 성별 |
| age_group | enum(age_group) | Y |  | 사용자 연령대 |
| mbti | varchar(4) | Y |  | 선택 MBTI |
| terms_agreed_at | datetime | Y |  | 필수 약관 동의 시각 |
| deletion_requested_at | datetime | Y |  | 회원탈퇴 요청 시각 |
| deactivated_at | datetime | Y |  | 비활성화 시각 |
| deleted_at | datetime | Y |  | 삭제 또는 비식별 처리 시각 |
| created_at | datetime | N |  | 생성일 |
| updated_at | datetime | N |  | 수정일 |

v2.6 대비 변경사항:
- `nickname_source`, `nickname_assigned_at` 제거
- `gender`(UserGender enum), `age_group`(AgeGroup enum) 추가
- `profile_media_asset_id` FK 추가

삭제 정책:
- MVP에서는 hard delete보다 soft delete 또는 비식별 처리를 기본으로 한다.
- nickname, email, image 등 개인정보 필드는 비식별 처리 가능하다.

## 5.2 accounts

NextAuth Prisma Adapter 호환을 위해 사용한다. Kakao OAuth 계정 연결 정보를 저장한다.

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 계정 ID |
| user_id | uuid | N | FK users.id (CASCADE) | 사용자 ID |
| type | varchar | N |  | 인증 타입 |
| provider | varchar | N |  | 프로바이더 (kakao) |
| provider_account_id | varchar | N |  | 프로바이더 계정 ID |
| refresh_token | text | Y |  | 리프레시 토큰 |
| access_token | text | Y |  | 액세스 토큰 |
| expires_at | int | Y |  | 토큰 만료 시각 |
| token_type | varchar | Y |  | 토큰 타입 |
| scope | varchar | Y |  | 인가 범위 |
| id_token | text | Y |  | ID 토큰 |
| session_state | varchar | Y |  | 세션 상태 |
| created_at | timestamp | N |  | 생성일 |
| updated_at | timestamp | N |  | 수정일 |

UNIQUE: (provider, provider_account_id)

> v2.6 대비 변경: `sessions`, `verification_tokens` 테이블은 JWT 전략 채택으로 제거되었다.

## 5.3 user_terms_agreements

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 약관 동의 이력 ID |
| user_id | uuid | N | FK users.id (CASCADE) | 사용자 ID |
| terms_type | enum(terms_type) | N |  | service/privacy/ai_notice/marketing/gift_recommendation_notice |
| terms_version | varchar(50) | N |  | 약관 버전 |
| is_required | boolean | N | DEFAULT true | 필수 여부 |
| agreed_at | datetime | N |  | 동의 시각 |
| created_at | datetime | N |  | 생성일 |

UNIQUE: (user_id, terms_type, terms_version)

> v2.6 대비 변경: `terms_type`에 `GIFT_RECOMMENDATION_NOTICE` 추가

## 5.4 media_assets

이미지 에셋 메타데이터를 저장한다. Supabase Storage와 연동한다.

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 에셋 ID |
| owner_user_id | uuid | Y | FK users.id | 소유자 |
| asset_type | enum(media_asset_type) | N |  | profile/result_card/character/system |
| bucket_name | varchar(100) | N |  | Storage 버킷명 |
| storage_path | varchar | N | UNIQUE | Storage 경로 |
| public_url | text | Y |  | 공개 URL |
| signed_url_required | boolean | N | DEFAULT false | 서명 URL 필요 여부 |
| mime_type | enum(image_mime_type) | Y |  | image/png, image/jpeg, image/webp |
| size_bytes | int | Y |  | 파일 크기 (bytes) |
| width | int | Y |  | 이미지 너비 |
| height | int | Y |  | 이미지 높이 |
| created_at | datetime | N |  | 생성일 |
| updated_at | datetime | N |  | 수정일 |
| deleted_at | datetime | Y |  | 삭제 시각 |

> v2.6에서는 MVP 제외였으나, 현재 구현 완료되었다.

## 5.5 dispute_rooms

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 방 내부 ID |
| room_no | varchar(50) | N | UNIQUE | 사용자에게 보여줄 방 번호 |
| creator_user_id | uuid | N | FK users.id | 방 생성자 ID |
| category_group | enum(category_group) | N |  | ROMANCE/FAMILY/FRIEND/WORK |
| room_mode | enum(room_mode) | N | DEFAULT ai_room | ai_room/invite_ready/one_to_one/closed/expired/deleted |
| room_token_hash | varchar(255) | Y | UNIQUE | 초대 링크 토큰 해시 |
| invite_created_at | datetime | Y |  | 초대 링크 생성 시각 |
| expires_at | datetime | Y |  | 초대 링크 만료 시각 |
| closed_at | datetime | Y |  | 방 종료 시각 |
| deleted_at | datetime | Y |  | 삭제 또는 비식별 처리 시각 |
| created_at | datetime | N |  | 생성일 |
| updated_at | datetime | N |  | 수정일 |

방 생성 시 `audit_logs.event_type = ROOM_CREATED`를 기록한다.

> v2.6 대비 변경: `room_mode` 기본값이 `ai_chat` → `ai_room`으로 변경

## 5.6 room_ai_conversations

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | AI 대화 세션 ID |
| room_id | uuid | N | FK dispute_rooms.id (CASCADE) | 방 ID |
| user_id | uuid | N | FK users.id (CASCADE) | 대화 사용자 |
| category_group | enum(category_group) | N |  | 카테고리 |
| title | varchar(200) | Y |  | 대화 제목 |
| initial_situation | text | Y |  | 초기 상황 설명 |
| ai_summary | text | Y |  | AI가 정리한 갈등 요약 |
| ai_advice | text | Y |  | AI 조언 |
| conversation_draft | text | Y |  | 대화 초안 |
| model_name | varchar(100) | Y |  | 사용된 AI 모델명 |
| status | enum(room_ai_conversation_status) | N | DEFAULT ACTIVE | active/analyzed/archived/deleted |
| created_at | datetime | N |  | 생성일 |
| updated_at | datetime | N |  | 수정일 |
| deleted_at | datetime | Y |  | 삭제 시각 |

v2.6 대비 변경사항:
- `title`, `initial_situation`, `ai_advice`, `conversation_draft`, `model_name`, `deleted_at` 추가
- `summary` → `ai_summary`로 변경
- status 값: `completed` → `ANALYZED`, `ARCHIVED` 추가

## 5.7 room_ai_messages

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 메시지 ID |
| room_id | uuid | N | FK dispute_rooms.id (CASCADE) | 방 ID |
| conversation_id | uuid | N | FK room_ai_conversations.id (CASCADE) | 대화 세션 ID |
| user_id | uuid | Y | FK users.id | 사용자 메시지인 경우 사용자 ID |
| sender_type | enum(message_sender_type) | N |  | user/ai/system |
| content | text | N |  | 메시지 내용 |
| message_order | int | N |  | 메시지 순서 |
| model_name | varchar(100) | Y |  | AI 응답 시 사용된 모델명 |
| created_at | datetime | N |  | 생성일 |
| deleted_at | datetime | Y |  | 삭제 또는 비식별 처리 시각 |

v2.6 대비 변경사항:
- `role`(user/assistant/system) → `sender_type`(user/ai/system)으로 변경
- `message_order`, `model_name` 추가

## 5.8 disputes

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 사건 ID |
| room_id | uuid | N | FK dispute_rooms.id (CASCADE), UNIQUE | 원본 방 ID (1:1 관계) |
| source_conversation_id | uuid | Y | FK room_ai_conversations.id | AI 대화 세션 참조 |
| category_group | enum(category_group) | N |  | ROMANCE/FAMILY/FRIEND/WORK |
| title | varchar(200) | N |  | 사건 제목 |
| description | text | Y |  | 사건 설명 |
| status | enum(dispute_status) | N | DEFAULT DRAFT | dispute_status |
| deleted_at | datetime | Y |  | 삭제 또는 비식별 처리 시각 |
| anonymized_at | datetime | Y |  | 비식별 처리 시각 |
| created_at | datetime | N |  | 생성일 |
| updated_at | datetime | N |  | 수정일 |

v2.6 대비 변경사항:
- `creator_user_id`, `opponent_user_id` 제거 (dispute_participants를 통해 관리)
- `ai_context_summary` → `description`으로 변경
- `source_conversation_id` FK 추가 (AI 대화 세션 연결)
- `expires_at`, `judged_at`, `closed_at` 제거
- `anonymized_at` 추가
- `room_id`에 UNIQUE 제약조건 추가 (1:1 관계)

## 5.9 dispute_participants

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 참여자 ID |
| dispute_id | uuid | N | FK disputes.id (CASCADE) | 사건 ID |
| user_id | uuid | N | FK users.id (CASCADE) | 사용자 ID |
| role | enum(participant_role) | N |  | ROLE_A / ROLE_B |
| joined_at | datetime | N |  | 참여 시각 |
| created_at | datetime | N |  | 생성일 |
| updated_at | datetime | N |  | 수정일 |

UNIQUE: (dispute_id, role), (dispute_id, user_id)

v2.6 대비 변경사항:
- `side`(A/B) + `role`(creator/opponent) → `role`(ROLE_A/ROLE_B)로 단일 필드로 통합
- `updated_at` 추가

## 5.10 dispute_statements

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 진술 ID |
| dispute_id | uuid | N | FK disputes.id (CASCADE) | 사건 ID |
| participant_id | uuid | N | FK dispute_participants.id (CASCADE) | 참여자 ID |
| user_id | uuid | N | FK users.id (CASCADE) | 작성자 ID |
| role | enum(participant_role) | N |  | ROLE_A / ROLE_B |
| content | text | N |  | 진술 원문 |
| ai_content | text | Y |  | AI가 정리한 진술 내용 |
| moderation_status | varchar(30) | N | DEFAULT 'pending' | 콘텐츠 검열 상태 |
| submitted_at | datetime | Y |  | 제출 시각 |
| anonymized_at | datetime | Y |  | 비식별 처리 시각 |
| created_at | datetime | N |  | 생성일 |
| updated_at | datetime | N |  | 수정일 |

UNIQUE: (dispute_id, role), (dispute_id, participant_id)

v2.6 대비 변경사항:
- `side` → `role`(ParticipantRole enum)로 변경
- `is_submitted` 제거 (`submitted_at` null 여부로 판단)
- `ai_content` 추가 (AI 정리 내용)
- `moderation_status` 추가
- `anonymized_at` 추가
- `deleted_at` 제거

## 5.11 ai_judgements

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 판결 ID |
| dispute_id | uuid | N | FK disputes.id (CASCADE), UNIQUE | 사건 ID (1:1 관계) |
| verdict_score_a | int | N |  | A측 판결 점수 |
| verdict_score_b | int | N |  | B측 판결 점수 |
| more_responsible_role | enum(responsible_role) | Y |  | 더 책임 있는 측 (ROLE_A/ROLE_B/EQUAL) |
| issue_summary | text | N |  | 핵심 쟁점 요약 |
| a_fault | text | Y |  | A측 잘못한 점 |
| b_fault | text | Y |  | B측 잘못한 점 |
| a_suggested_line | text | Y |  | A측에게 제안하는 대사 |
| b_suggested_line | text | Y |  | B측에게 제안하는 대사 |
| result_conflict_detail_id | uuid | N | FK conflict_type_details.id | 선택된 세부 결과 유형 |
| result_card_id | uuid | Y | FK judgement_result_cards.id, UNIQUE | 결과 카드 (1:1 관계) |
| ai_notice_id | uuid | Y | FK ai_result_notices.id | 결과 고지 |
| result_card_summary | text | Y |  | 결과 카드 요약 |
| share_message | varchar(255) | Y |  | 공유 메시지 |
| raw_response | json | Y |  | 원본 AI 응답. 운영 정책에 따라 최소 저장 |
| model_name | varchar(100) | N |  | 사용된 AI 모델명 |
| created_at | datetime | N |  | 생성일 |
| updated_at | datetime | N |  | 수정일 |

v2.6 대비 주요 변경사항:
- `judgement_score_a/b` → `verdict_score_a/b`로 변경
- `responsible_side`(A/B/BOTH/NONE) → `more_responsible_role`(ROLE_A/ROLE_B/EQUAL)로 변경
- `judgement_reason`, `reconciliation_proposal` 제거
- `a_fault`, `b_fault`, `a_suggested_line`, `b_suggested_line` 추가
- `selected_group_id` 제거 (상위 그룹 FK 미사용)
- `selected_detail_id` → `result_conflict_detail_id`로 변경
- `result_card_id`, `ai_notice_id`, `result_card_summary`, `share_message`, `model_name`, `updated_at` 추가

제거 필드 (v2.6에서 이미 제거):
- `empathy_score_a/b`
- `communication_score_a/b`

## 5.12 ai_result_notices

AI 판결 결과 참고용 고지 문구를 관리한다.

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 고지 ID |
| notice_type | varchar(50) | N |  | legal/medical/psychological/general |
| title | varchar(200) | N |  | 고지 제목 |
| content | text | N |  | 고지 내용 |
| version | varchar(50) | N |  | 고지 버전 |
| is_active | boolean | N | DEFAULT true | 사용 여부 |
| created_at | datetime | N |  | 생성일 |
| updated_at | datetime | N |  | 수정일 |

## 5.13 conflict_type_details

세부 결과 유형을 마스터 테이블로 관리한다.

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 세부 유형 ID |
| detail_code | varchar(80) | N | UNIQUE | 세부 유형 코드 |
| display_name | varchar(100) | N |  | 화면 표시명 |
| description | text | Y |  | 유형 설명 |
| card_image_url | text | Y |  | 결과 카드 이미지 URL |
| sort_order | int | N |  | 화면 표시 순서 |
| is_active | boolean | N | DEFAULT true | 사용 여부 |
| created_at | datetime | N |  | 생성일 |
| updated_at | datetime | N |  | 수정일 |

v2.6 대비 변경사항:
- `conflict_type_groups` 테이블 제거. 상위 그룹 없이 세부 유형만 관리
- `card_image_url` 필드 추가

## 5.14 judgement_result_cards

결과 카드 메타데이터를 저장한다.

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 결과 카드 ID |
| character_type | varchar(80) | Y |  | 캐릭터 유형 코드 |
| card_title | varchar(200) | N |  | 카드 제목 |
| card_summary | text | N |  | 카드 요약 (원문 제외) |
| share_message | varchar(255) | Y |  | 공유 메시지 |
| image_asset_id | uuid | Y | FK media_assets.id | 카드 이미지 에셋 |
| image_status | enum(card_image_status) | N | DEFAULT PENDING | 이미지 생성 상태 |
| share_enabled | boolean | N | DEFAULT true | 공유 허용 여부 |
| generated_at | datetime | Y |  | 생성 완료 시각 |
| created_at | datetime | N |  | 생성일 |
| updated_at | datetime | N |  | 수정일 |

v2.6 대비 변경사항:
- `card_template`, `share_title`, `share_summary`, `public_payload` 제거
- `character_type`, `card_title`, `card_summary`, `share_message`, `image_asset_id`, `image_status`, `share_enabled`, `generated_at`, `updated_at` 추가
- `media_assets` FK를 통한 이미지 연결 추가

## 5.15 gift_recommendations

판결 후 화해 행동을 돕기 위한 선물 추천 결과를 저장한다.

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 추천 ID |
| judgement_id | uuid | N | FK ai_judgements.id (CASCADE) | 판결 ID |
| dispute_id | uuid | N | FK disputes.id (CASCADE) | 사건 ID |
| gift_sender_user_id | uuid | N | FK users.id (CASCADE) | 선물 보내는 사용자 |
| gift_receiver_user_id | uuid | N | FK users.id (CASCADE) | 선물 받는 사용자 |
| sender_role | enum(participant_role) | N |  | 보내는 측 역할 |
| receiver_role | enum(participant_role) | N |  | 받는 측 역할 |
| recipient_gender | enum(user_gender) | Y |  | 수신자 성별 |
| recipient_age_group | enum(age_group) | Y |  | 수신자 연령대 |
| recipient_mbti | varchar(4) | Y |  | 수신자 MBTI |
| recipient_profile_source | enum(recipient_profile_source) | N | DEFAULT USER_PROFILE | 프로필 정보 출처 |
| recommendation_reason | text | Y |  | 추천 사유 |
| message_card_text | text | Y |  | 메시지 카드 문구 |
| status | enum(gift_recommendation_status) | N | DEFAULT PENDING | pending/generated/failed |
| created_at | datetime | N |  | 생성일 |
| updated_at | datetime | N |  | 수정일 |

v2.6 대비 변경사항:
- 선물 보내는 사용자/받는 사용자 FK 추가
- 수신자 프로필 정보(성별/연령/MBTI) 필드 추가
- `recipient_profile_source` 추가 (프로필 정보 출처 추적)
- `status` enum 추가

## 5.16 gift_recommendation_items

선물 추천 아이템 목록을 저장한다.

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 아이템 ID |
| recommendation_id | uuid | Y | FK gift_recommendations.id (CASCADE) | 추천 ID |
| target_gender | varchar(20) | Y |  | 대상 성별 |
| target_age_group | int | Y |  | 대상 연령대 |
| target_mbti | varchar(4) | Y |  | 대상 MBTI |
| item_name | varchar(200) | N |  | 아이템명 |
| price_range | varchar(100) | Y |  | 가격대 |
| category | varchar(100) | Y |  | 카테고리 |
| image_url | text | Y |  | 이미지 URL |
| external_url | text | Y |  | 외부 링크 |
| reason | text | Y |  | 추천 사유 |
| is_active | boolean | N | DEFAULT true | 활성 여부 |
| sort_order | int | N | DEFAULT 0 | 정렬 순서 |
| created_at | datetime | N |  | 생성일 |
| updated_at | datetime | N |  | 수정일 |

## 5.17 emotion_diaries

감정일기를 저장한다. 사건과 연결하지 않아도 작성할 수 있다.

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 감정일기 ID |
| user_id | uuid | N | FK users.id (CASCADE) | 작성자 |
| diary_date | date | N |  | 일기 날짜 |
| title | varchar(200) | Y |  | 일기 제목 |
| emotion_type | varchar(80) | Y |  | 감정 유형 |
| content | text | N |  | 일기 내용 |
| created_at | datetime | N |  | 생성일 |
| updated_at | datetime | N |  | 수정일 |
| deleted_at | datetime | Y |  | 삭제 시각 |

v2.6 대비 변경사항:
- `emotion_type` 필드 추가
- `diary_date`를 date 타입으로 명확화

## 5.18 chat_sessions

개인 분석/채팅 세션을 저장한다.

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 세션 ID |
| user_id | uuid | N | FK users.id (CASCADE) | 사용자 ID |
| created_at | datetime | N |  | 생성일 |
| updated_at | datetime | N |  | 수정일 |

> v2.6의 `personal_analyses` 테이블을 대체한다. 개인 갈등 상황 정리·분석·조언 기능을 채팅 형태로 제공한다.

## 5.19 chat_messages

개인 분석/채팅 메시지를 저장한다.

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 메시지 ID |
| session_id | uuid | N | FK chat_sessions.id (CASCADE) | 세션 ID |
| role | varchar(10) | N |  | 발신자 역할 (user/assistant) |
| content | text | N |  | 메시지 내용 |
| created_at | datetime | N |  | 생성일 |

---

# 6. 로그 테이블 정의

## 6.1 audit_logs

서비스 주요 이벤트의 공통 감사 로그를 저장한다.

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 로그 ID |
| event_type | enum(audit_event_type) | N |  | 이벤트 유형 |
| actor_user_id | uuid | Y |  | 행위자 (FK 없음, 삭제 후에도 보존) |
| target_user_id | uuid | Y |  | 대상 사용자 (FK 없음) |
| room_id | uuid | Y |  | 관련 방 (FK 없음) |
| dispute_id | uuid | Y |  | 관련 사건 (FK 없음) |
| ip_hash | varchar | Y |  | IP hash |
| user_agent | text | Y |  | User-Agent |
| metadata | json | Y |  | 비민감 추가 정보 |
| created_at | datetime | N |  | 생성일 |

> v2.6 대비 변경: FK를 제거하고 값만 저장하는 방식으로 변경. 삭제된 사용자/방/사건의 로그도 보존 가능.

## 6.2 room_access_logs

초대 링크 접근, 참여 성공/실패, 만료 링크 접근 등을 기록한다.

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 접근 로그 ID |
| room_id | uuid | Y | FK dispute_rooms.id | 접근한 방 |
| user_id | uuid | Y |  | 접근 사용자 (FK 없음) |
| result | enum(access_result) | N |  | allowed/denied |
| reason | varchar(100) | Y |  | 허용 또는 차단 사유 |
| created_at | datetime | N |  | 접근 시각 |

v2.6 대비 변경사항:
- `ip_hash`, `user_agent` 제거 (간소화)
- `user_id` FK 제거

## 6.3 moderation_logs

욕설·혐오 표현·개인정보 노출 감지 결과를 저장한다.

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 로그 ID |
| room_id | uuid | Y |  | 관련 방 ID (FK 없음) |
| conversation_id | uuid | Y |  | 관련 대화 세션 ID (FK 없음) |
| dispute_id | uuid | Y |  | 관련 사건 ID (FK 없음) |
| statement_id | uuid | Y | FK dispute_statements.id | 관련 진술 ID |
| user_id | uuid | Y |  | 대상 사용자 ID (FK 없음) |
| target | enum(moderation_target) | N |  | ai_message/statement/card_text |
| is_blocked | boolean | N |  | 차단 여부 |
| reason | varchar(255) | Y |  | 감지 사유 |
| confidence_score | decimal(5,4) | Y |  | 신뢰도 점수 |
| duration_ms | int | Y |  | 처리 소요 시간 (ms) |
| model_name | varchar(100) | Y |  | 사용된 모델명 |
| created_at | datetime | N |  | 생성일 |

주의: 검사 대상 원문 전체를 저장하지 않는다.

v2.6 대비 변경사항:
- `target` 필드를 enum(moderation_target)으로 타입 변경
- `confidence_score`, `duration_ms`, `model_name` 추가

## 6.4 api_error_logs

API 에러 로그를 저장한다.

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
| --- | --- | --- | --- | --- |
| id | uuid | N | PK | 로그 ID |
| user_id | uuid | Y |  | 사용자 ID (FK 없음) |
| room_id | uuid | Y |  | 관련 방 ID (FK 없음) |
| conversation_id | uuid | Y |  | 관련 대화 세션 ID (FK 없음) |
| dispute_id | uuid | Y |  | 관련 사건 ID (FK 없음) |
| endpoint | varchar(255) | N |  | API 엔드포인트 |
| http_method | enum(http_method) | N |  | HTTP 메서드 |
| status_code | int | N |  | HTTP 상태 코드 |
| error_code | varchar(100) | N |  | 에러 코드 |
| error_message | text | Y |  | 에러 메시지 |
| error_context | json | Y |  | 비민감 에러 컨텍스트 |
| created_at | datetime | N |  | 생성일 |

주의:
- 진술 원문, 개인 분석 원문, 감정일기 원문은 저장하지 않는다.
- request body 전체를 저장하지 않는다.

v2.6 대비 변경사항:
- `conversation_id` 추가
- `http_method`를 enum(http_method)으로 타입 변경
- `error_context`(json) 추가

---

# 7. 미구현 테이블

## 7.1 MVP 제외 (향후 확장 시 추가)

```
shop_items              → MVP 제외
user_items              → MVP 제외
point_transactions      → MVP 제외
```

## 7.2 ERD v2.6 대비 미구현 상태

아래 테이블은 v2.6 ERD에 정의되었으나 현재 Prisma schema에 구현되지 않은 상태다.

```
conflict_type_groups    → 상위 결과 그룹 테이블. 현재 conflict_type_details만 사용
calendar_records        → 달력 기록 테이블. 향후 구현 예정
dispute_statistics      → 통계 집계 테이블. 향후 구현 예정
judgement_logs          → AI 판결 요청 처리 로그. 향후 구현 예정
deletion_logs           → 리소스 삭제 이력. 향후 구현 예정
user_deletion_logs      → 회원탈퇴 이력. audit_logs로 통합 관리 중
personal_analyses       → chat_sessions/chat_messages로 대체
```

---

# 8. 변경 이력

| 버전 | 변경 내용 |
| --- | --- |
| v2.7 | Prisma schema 실제 구현 기준 반영. room_mode `ai_chat` → `ai_room` 변경. `personal_analyses` 제거 → `chat_sessions`/`chat_messages` 대체. `media_assets` 구현 완료. `conflict_type_groups` 미구현 확인. `DisputeParticipant` side+role 이중 체계 → role(ROLE_A/ROLE_B) 단일 체계 통합. `AiJudgment` 필드 대폭 변경(aFault/bFault/aSuggestedLine/bSuggestedLine 추가, judgementReason/reconciliationProposal 제거). `GiftRecommendation` 수신자 프로필 필드 추가. `sessions`/`verification_tokens` 테이블 제거(JWT 전략). Enum Prisma 값 및 DB 매핑 값 병기. 미사용 Enum 목록 추가. 미구현 테이블 현황 정리. |
| v2.6 | NextAuth 모델 반영, 백엔드 랜덤 닉네임 컬럼 추가, audit_logs 및 user_deletion_logs 추가, 방 생성/회원탈퇴/사용자 삭제 로그 정책 강화, media_assets MVP 제외 유지 |
| v2.5 | 이미지 저장 정책을 public/images + html-to-image 중심으로 수정, shop/points/user-items/media_assets MVP 제외, 공감/소통 점수 삭제 유지, 4개 카테고리 및 AI 대화방 선생성 기준 확정 |
