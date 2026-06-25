-- CreateEnum
CREATE TYPE "category_group" AS ENUM ('romance', 'family', 'friend', 'work');

-- CreateEnum
CREATE TYPE "room_mode" AS ENUM ('ai_room', 'invite_ready', 'one_to_one', 'closed', 'expired', 'deleted');

-- CreateEnum
CREATE TYPE "room_ai_conversation_status" AS ENUM ('active', 'analyzed', 'archived', 'deleted');

-- CreateEnum
CREATE TYPE "message_sender_type" AS ENUM ('user', 'ai', 'system');

-- CreateEnum
CREATE TYPE "dispute_status" AS ENUM ('draft', 'waiting_opponent', 'opponent_joined', 'both_submitted', 'judging', 'judged', 'closed', 'expired', 'deleted');

-- CreateEnum
CREATE TYPE "participant_role" AS ENUM ('role_a', 'role_b');

-- CreateEnum
CREATE TYPE "responsible_role" AS ENUM ('role_a', 'role_b', 'equal');

-- CreateEnum
CREATE TYPE "terms_type" AS ENUM ('service', 'privacy', 'ai_notice', 'marketing', 'gift_recommendation_notice');

-- CreateEnum
CREATE TYPE "user_gender" AS ENUM ('male', 'female', 'other', 'unknown', 'no_answer');

-- CreateEnum
CREATE TYPE "age_group" AS ENUM ('under_10', 'teens', 'twenties', 'thirties', 'forties', 'fifties', 'sixties_plus', 'unknown', 'no_answer');

-- CreateEnum
CREATE TYPE "media_asset_type" AS ENUM ('profile', 'result_card', 'character', 'system');

-- CreateEnum
CREATE TYPE "image_mime_type" AS ENUM ('image/png', 'image/jpeg', 'image/webp');

-- CreateEnum
CREATE TYPE "card_image_status" AS ENUM ('pending', 'generated', 'failed');

-- CreateEnum
CREATE TYPE "recipient_profile_source" AS ENUM ('user_profile', 'manual_input', 'mixed');

-- CreateEnum
CREATE TYPE "gift_recommendation_status" AS ENUM ('pending', 'generated', 'failed');

-- CreateEnum
CREATE TYPE "moderation_target" AS ENUM ('ai_message', 'statement', 'card_text');

-- CreateEnum
CREATE TYPE "access_result" AS ENUM ('allowed', 'denied');

-- CreateEnum
CREATE TYPE "audit_event_type" AS ENUM ('ROOM_CREATED', 'INVITE_LINK_CREATED', 'USER_JOINED_ROOM', 'AI_MESSAGE_CREATED', 'STATEMENT_SUBMITTED', 'JUDGMENT_CREATED', 'RESULT_CARD_CREATED', 'GIFT_RECOMMENDATION_CREATED', 'USER_DELETION_REQUESTED', 'USER_DELETED', 'USER_ANONYMIZED', 'API_ERROR', 'MODERATION_FLAGGED', 'USER_REACTIVATED');

-- CreateEnum
CREATE TYPE "http_method" AS ENUM ('GET', 'POST', 'PATCH', 'PUT', 'DELETE');

-- CreateEnum
CREATE TYPE "ai_error_type" AS ENUM ('timeout', 'json_parse', 'model_error', 'network_error', 'unknown');

-- CreateEnum
CREATE TYPE "ai_log_type" AS ENUM ('ai_room', 'judgement');

-- CreateEnum
CREATE TYPE "deletion_type" AS ENUM ('soft_delete', 'anonymize', 'hard_delete');

-- CreateEnum
CREATE TYPE "point_transaction_type" AS ENUM ('judgement_reward', 'purchase', 'refund', 'admin_adjustment');

-- CreateEnum
CREATE TYPE "request_status" AS ENUM ('pending', 'success', 'failed', 'timeout', 'parse_failed');

-- CreateEnum
CREATE TYPE "shop_item_type" AS ENUM ('theme', 'profile_decoration');

-- CreateEnum
CREATE TYPE "statistics_source_type" AS ENUM ('ai_room', 'one_to_one_judgement', 'combined');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "kakao_id" VARCHAR(100),
    "nickname" VARCHAR(100),
    "profile_image_url" TEXT,
    "profile_media_asset_id" UUID,
    "gender" "user_gender",
    "age_group" "age_group",
    "mbti" VARCHAR(4),
    "terms_agreed_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "deactivated_at" TIMESTAMP(3),
    "deletion_requested_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_terms_agreements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "terms_type" "terms_type" NOT NULL,
    "terms_version" VARCHAR(50) NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "agreed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_terms_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_user_id" UUID,
    "asset_type" "media_asset_type" NOT NULL,
    "bucket_name" VARCHAR(100) NOT NULL,
    "storage_path" TEXT NOT NULL,
    "public_url" TEXT,
    "signed_url_required" BOOLEAN NOT NULL DEFAULT false,
    "mime_type" "image_mime_type",
    "size_bytes" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_result_notices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "notice_type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "version" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_result_notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conflict_type_details" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "detail_code" VARCHAR(80) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "card_image_url" TEXT,

    CONSTRAINT "conflict_type_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispute_rooms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "room_no" VARCHAR(50) NOT NULL,
    "creator_user_id" UUID NOT NULL,
    "category_group" "category_group" NOT NULL,
    "room_mode" "room_mode" NOT NULL DEFAULT 'ai_room',
    "room_token_hash" VARCHAR(255),
    "invite_created_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispute_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_ai_conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "room_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "category_group" "category_group" NOT NULL,
    "title" VARCHAR(200),
    "initial_situation" TEXT,
    "ai_summary" TEXT,
    "ai_advice" TEXT,
    "conversation_draft" TEXT,
    "model_name" VARCHAR(100),
    "status" "room_ai_conversation_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "room_ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_ai_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "room_id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "user_id" UUID,
    "sender_type" "message_sender_type" NOT NULL,
    "content" TEXT NOT NULL,
    "message_order" INTEGER NOT NULL,
    "model_name" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "room_ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "room_id" UUID NOT NULL,
    "source_conversation_id" UUID,
    "category_group" "category_group" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "status" "dispute_status" NOT NULL DEFAULT 'draft',
    "deleted_at" TIMESTAMP(3),
    "anonymized_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispute_participants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dispute_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "participant_role" NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispute_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispute_statements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dispute_id" UUID NOT NULL,
    "participant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "participant_role" NOT NULL,
    "content" TEXT NOT NULL,
    "moderation_status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "submitted_at" TIMESTAMP(3),
    "anonymized_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ai_content" TEXT,

    CONSTRAINT "dispute_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judgement_result_cards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "character_type" VARCHAR(80),
    "card_title" VARCHAR(200) NOT NULL,
    "card_summary" TEXT NOT NULL,
    "share_message" VARCHAR(255),
    "image_asset_id" UUID,
    "image_status" "card_image_status" NOT NULL DEFAULT 'pending',
    "share_enabled" BOOLEAN NOT NULL DEFAULT true,
    "generated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "judgement_result_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_judgements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dispute_id" UUID NOT NULL,
    "verdict_score_a" INTEGER NOT NULL,
    "verdict_score_b" INTEGER NOT NULL,
    "more_responsible_role" "responsible_role",
    "issue_summary" TEXT NOT NULL,
    "result_conflict_detail_id" UUID NOT NULL,
    "result_card_id" UUID,
    "ai_notice_id" UUID,
    "result_card_summary" TEXT,
    "share_message" VARCHAR(255),
    "raw_response" JSONB,
    "model_name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "a_fault" TEXT,
    "b_fault" TEXT,
    "a_suggested_line" TEXT,
    "b_suggested_line" TEXT,

    CONSTRAINT "ai_judgements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_recommendations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "judgement_id" UUID NOT NULL,
    "dispute_id" UUID NOT NULL,
    "gift_sender_user_id" UUID NOT NULL,
    "gift_receiver_user_id" UUID NOT NULL,
    "sender_role" "participant_role" NOT NULL,
    "receiver_role" "participant_role" NOT NULL,
    "recipient_gender" "user_gender",
    "recipient_age_group" "age_group",
    "recipient_mbti" VARCHAR(4),
    "recipient_profile_source" "recipient_profile_source" NOT NULL DEFAULT 'user_profile',
    "recommendation_reason" TEXT,
    "message_card_text" TEXT,
    "status" "gift_recommendation_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_recommendation_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recommendation_id" UUID NOT NULL,
    "item_name" VARCHAR(200) NOT NULL,
    "price_range" VARCHAR(100),
    "category" VARCHAR(100),
    "image_url" TEXT,
    "external_url" TEXT,
    "reason" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_recommendation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emotion_diaries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "diary_date" DATE NOT NULL,
    "title" VARCHAR(200),
    "emotion_type" VARCHAR(80),
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "emotion_diaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_access_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "room_id" UUID,
    "user_id" UUID,
    "result" "access_result" NOT NULL,
    "reason" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "room_id" UUID,
    "conversation_id" UUID,
    "dispute_id" UUID,
    "statement_id" UUID,
    "user_id" UUID,
    "target" "moderation_target" NOT NULL,
    "is_blocked" BOOLEAN NOT NULL,
    "reason" VARCHAR(255),
    "confidence_score" DECIMAL(5,4),
    "duration_ms" INTEGER,
    "model_name" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_error_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "room_id" UUID,
    "conversation_id" UUID,
    "dispute_id" UUID,
    "endpoint" VARCHAR(255) NOT NULL,
    "http_method" "http_method" NOT NULL,
    "status_code" INTEGER NOT NULL,
    "error_code" VARCHAR(100) NOT NULL,
    "error_message" TEXT,
    "error_context" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_type" "audit_event_type" NOT NULL,
    "actor_user_id" UUID,
    "target_user_id" UUID,
    "room_id" UUID,
    "dispute_id" UUID,
    "ip_hash" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_kakao_id_key" ON "users"("kakao_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_terms_agreements_user_terms_unique" ON "user_terms_agreements"("user_id", "terms_type", "terms_version");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_storage_path_key" ON "media_assets"("storage_path");

-- CreateIndex
CREATE UNIQUE INDEX "conflict_type_details_detail_code_key" ON "conflict_type_details"("detail_code");

-- CreateIndex
CREATE UNIQUE INDEX "dispute_rooms_room_no_key" ON "dispute_rooms"("room_no");

-- CreateIndex
CREATE UNIQUE INDEX "dispute_rooms_room_token_hash_key" ON "dispute_rooms"("room_token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "disputes_room_id_key" ON "disputes"("room_id");

-- CreateIndex
CREATE UNIQUE INDEX "dispute_participants_dispute_id_role_key" ON "dispute_participants"("dispute_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "dispute_participants_dispute_id_user_id_key" ON "dispute_participants"("dispute_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "dispute_statements_dispute_id_role_key" ON "dispute_statements"("dispute_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "dispute_statements_dispute_id_participant_id_key" ON "dispute_statements"("dispute_id", "participant_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_judgements_dispute_id_key" ON "ai_judgements"("dispute_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_judgements_result_card_id_key" ON "ai_judgements"("result_card_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_profile_media_asset_id_fkey" FOREIGN KEY ("profile_media_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_terms_agreements" ADD CONSTRAINT "user_terms_agreements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_rooms" ADD CONSTRAINT "dispute_rooms_creator_user_id_fkey" FOREIGN KEY ("creator_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_ai_conversations" ADD CONSTRAINT "room_ai_conversations_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "dispute_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_ai_conversations" ADD CONSTRAINT "room_ai_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_ai_messages" ADD CONSTRAINT "room_ai_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "room_ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_ai_messages" ADD CONSTRAINT "room_ai_messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "dispute_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_ai_messages" ADD CONSTRAINT "room_ai_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "dispute_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_source_conversation_id_fkey" FOREIGN KEY ("source_conversation_id") REFERENCES "room_ai_conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_participants" ADD CONSTRAINT "dispute_participants_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_participants" ADD CONSTRAINT "dispute_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_statements" ADD CONSTRAINT "dispute_statements_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_statements" ADD CONSTRAINT "dispute_statements_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "dispute_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_statements" ADD CONSTRAINT "dispute_statements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judgement_result_cards" ADD CONSTRAINT "judgement_result_cards_image_asset_id_fkey" FOREIGN KEY ("image_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_judgements" ADD CONSTRAINT "ai_judgements_ai_notice_id_fkey" FOREIGN KEY ("ai_notice_id") REFERENCES "ai_result_notices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_judgements" ADD CONSTRAINT "ai_judgements_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_judgements" ADD CONSTRAINT "ai_judgements_result_card_id_fkey" FOREIGN KEY ("result_card_id") REFERENCES "judgement_result_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_judgements" ADD CONSTRAINT "ai_judgements_result_conflict_detail_id_fkey" FOREIGN KEY ("result_conflict_detail_id") REFERENCES "conflict_type_details"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_recommendations" ADD CONSTRAINT "gift_recommendations_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_recommendations" ADD CONSTRAINT "gift_recommendations_gift_receiver_user_id_fkey" FOREIGN KEY ("gift_receiver_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_recommendations" ADD CONSTRAINT "gift_recommendations_gift_sender_user_id_fkey" FOREIGN KEY ("gift_sender_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_recommendations" ADD CONSTRAINT "gift_recommendations_judgement_id_fkey" FOREIGN KEY ("judgement_id") REFERENCES "ai_judgements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_recommendation_items" ADD CONSTRAINT "gift_recommendation_items_recommendation_id_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "gift_recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emotion_diaries" ADD CONSTRAINT "emotion_diaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_access_logs" ADD CONSTRAINT "room_access_logs_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "dispute_rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_statement_id_fkey" FOREIGN KEY ("statement_id") REFERENCES "dispute_statements"("id") ON DELETE SET NULL ON UPDATE CASCADE;
