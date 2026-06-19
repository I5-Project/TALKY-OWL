import { type Prisma } from '@prisma/client'
import type { AiJudgmentDto, ResponsibleRole, CardImageStatus } from '@/types/judgment'

export type AiJudgmentWithRelations = Prisma.AiJudgmentGetPayload<{
  include: {
    resultConflictGroup: true
    resultConflictDetail: true
    resultCard: true
    aiNotice: true
  }
}>

export function toAiJudgmentDto(j: AiJudgmentWithRelations): AiJudgmentDto {
  return {
    id: j.id,
    disputeId: j.disputeId,
    verdictScoreA: j.verdictScoreA,
    verdictScoreB: j.verdictScoreB,
    moreResponsibleRole: j.moreResponsibleRole
      ? (j.moreResponsibleRole.toLowerCase() as ResponsibleRole)
      : null,
    issueSummary: j.issueSummary,
    aFault: j.aFault ?? null,
    bFault: j.bFault ?? null,
    aSuggestedLine: j.aSuggestedLine ?? null,
    bSuggestedLine: j.bSuggestedLine ?? null,
    resultConflictGroup: {
      id: j.resultConflictGroup.id,
      groupCode: j.resultConflictGroup.groupCode,
      displayName: j.resultConflictGroup.displayName,
      description: j.resultConflictGroup.description ?? null,
    },
    resultConflictDetail: {
      id: j.resultConflictDetail.id,
      groupId: j.resultConflictDetail.groupId,
      detailCode: j.resultConflictDetail.detailCode,
      displayName: j.resultConflictDetail.displayName,
      description: j.resultConflictDetail.description ?? null,
      characterAssetId: j.resultConflictDetail.characterAssetId ?? null,
    },
    resultCard: j.resultCard
      ? {
          id: j.resultCard.id,
          characterType: j.resultCard.characterType ?? null,
          cardTitle: j.resultCard.cardTitle,
          cardSummary: j.resultCard.cardSummary,
          shareMessage: j.resultCard.shareMessage ?? null,
          imageAssetId: j.resultCard.imageAssetId ?? null,
          imageStatus: j.resultCard.imageStatus.toLowerCase() as CardImageStatus,
          shareEnabled: j.resultCard.shareEnabled,
          generatedAt: j.resultCard.generatedAt?.toISOString() ?? null,
          createdAt: j.resultCard.createdAt.toISOString(),
        }
      : null,
    resultCardSummary: j.resultCardSummary ?? null,
    shareMessage: j.shareMessage ?? null,
    aiNotice: j.aiNotice
      ? {
          id: j.aiNotice.id,
          noticeType: j.aiNotice.noticeType,
          title: j.aiNotice.title,
          content: j.aiNotice.content,
          version: j.aiNotice.version,
        }
      : null,
    modelName: j.modelName,
    createdAt: j.createdAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
  }
}
