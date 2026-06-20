-- room_mode: ai_chat → open 으로 이름 변경
ALTER TYPE "room_mode" RENAME VALUE 'ai_chat' TO 'open';

-- dispute_status: a_submitted 추가 (both_submitted 이전)
ALTER TYPE "dispute_status" ADD VALUE IF NOT EXISTS 'a_submitted' BEFORE 'both_submitted';
