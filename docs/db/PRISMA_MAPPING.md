# PRISMA_MAPPING.md

Prisma 매핑 기준 문서

---

## 1. 기본 원칙

```txt
DB column 네이밍:    snake_case
Prisma field 네이밍: camelCase
매핑:                @map() 필수 사용
테이블 매핑:         @@map() 필수 사용
```

---

## 2. 작성 예시

```prisma
model DisputeRoom {
  id            Int      @id @default(autoincrement())
  creatorUserId Int      @map("creator_user_id")
  roomMode      String   @map("room_mode")
  createdAt     DateTime @default(now()) @map("created_at")

  @@map("dispute_rooms")
}
```

---

## 3. 금지사항

```txt
ERD 확정 없이 모델 상세 작성 금지
DB relation 임의 작성 금지
결과 유형을 Prisma Enum으로 하드코딩 금지
shop / points / user-items 모델 작성 금지
```

---

## 4. 향후 작성 대상

ERD 및 `docs/db/MASTER_DATA.md` 확정 후 아래 모델을 순서대로 작성한다.

```txt
users
dispute_rooms
disputes
dispute_participants
dispute_statements
judgements
judgement_result_types   ← Enum 대신 마스터 테이블로 관리
gift_recommendations
emotion_diaries
calendar_events
```

상세 매핑은 ERD와 `docs/db/PRISMA_MAPPING.md`를 기준으로 작성한다.

---

## 5. Prisma 관련 명령어

```bash
# 클라이언트 생성
npm run prisma:generate

# 마이그레이션 실행
npm run prisma:migrate
```
