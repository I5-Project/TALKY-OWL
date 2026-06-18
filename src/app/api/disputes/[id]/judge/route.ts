import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import type { DisputeStatus } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSessionUserId } from '@/lib/auth/session'
import { toAiJudgmentDto } from '@/domains/judgement/judgment.mapper'
import type { ApiResponse } from '@/types/common'
import type { AiJudgmentDto } from '@/types/judgment'

// TODO: src/lib/ai 구현 후 import 추가
// import { generateAiJudgment } from '@/lib/ai/judgment'

// POST /api/disputes/:id/judge
// AI 판결 요청. both_submitted 상태일 때만 가능. 중복 요청 방지 (멱등성)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    )
  }

  const { id } = await params

  // JUDGING 상태 전환 여부를 추적해 외부 catch에서도 원복할 수 있게 함
  let statusSetToJudging = false
  let previousStatus: DisputeStatus = 'BOTH_SUBMITTED'

  try {
    const dispute = await prisma.dispute.findFirst({
      where: { id, deletedAt: null },
      include: { participants: true, statements: true },
    })
    if (!dispute) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'DISPUTE_NOT_FOUND', message: '사건을 찾을 수 없습니다.' } },
        { status: 404 },
      )
    }

    const isParticipant = dispute.participants.some((p) => p.userId === userId)
    if (!isParticipant) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'FORBIDDEN', message: '이 사건의 참여자가 아닙니다.' } },
        { status: 403 },
      )
    }

    // 판결 완료 상태면 기존 결과 반환 (멱등성)
    if (dispute.status === 'JUDGED') {
      const existing = await prisma.aiJudgment.findFirst({
        where: { disputeId: id },
        include: {
          resultConflictGroup: true,
          resultConflictDetail: true,
          resultCard: true,
          aiNotice: true,
        },
      })
      if (existing) {
        return NextResponse.json<ApiResponse<AiJudgmentDto>>({
          success: true,
          data: toAiJudgmentDto(existing),
        })
      }
    }

    // 판결 진행 중 - 중복 요청 차단
    if (dispute.status === 'JUDGING') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'JUDGMENT_IN_PROGRESS',
            message: 'AI 판결이 진행 중입니다. 잠시 후 다시 확인해주세요.',
          },
        },
        { status: 409 },
      )
    }

    const isSolo = dispute.participants.length === 1
    previousStatus = dispute.status

    // 판결 가능 여부 확인
    if (isSolo) {
      // 1인: a_submitted 상태 확인
      if (dispute.status !== 'A_SUBMITTED') {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'DISPUTE_NOT_READY',
              message: '진술을 먼저 작성해주세요.',
              details: `현재 사건 상태: ${dispute.status.toLowerCase()}`,
            },
          },
          { status: 422 },
        )
      }
    } else {
      // 2인: 양측 진술 완료(BOTH_SUBMITTED) 확인
      if (dispute.status !== 'BOTH_SUBMITTED') {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'DISPUTE_NOT_READY',
              message: '양측 진술이 완료된 후 AI 판결을 요청할 수 있습니다.',
              details: `현재 사건 상태: ${dispute.status.toLowerCase()}`,
            },
          },
          { status: 422 },
        )
      }
    }

    // 판결 진행 상태로 전환 (중복 요청 잠금)
    await prisma.dispute.update({
      where: { id },
      data: { status: 'JUDGING' },
    })
    statusSetToJudging = true

    try {
      // AI 판결 생성
      // TODO: src/lib/ai/judgment.ts 구현 후 아래 로직으로 교체
      //
      // const aiResult = await generateAiJudgment({
      //   disputeId: id,
      //   categoryGroup: dispute.categoryGroup,
      //   statements: dispute.statements.map((s) => ({
      //     role: s.role,
      //     content: s.content,
      //   })),
      // })
      //
      // const judgment = await prisma.$transaction(async (tx) => {
      //   const resultCard = await tx.judgmentResultCard.create({ data: { ... } })
      //   const created = await tx.aiJudgment.create({
      //     data: {
      //       disputeId: id,
      //       ...aiResult,
      //       resultCardId: resultCard.id,
      //     },
      //   })
      //   await tx.dispute.update({ where: { id }, data: { status: 'JUDGED' } })
      //   return tx.aiJudgment.findUniqueOrThrow({
      //     where: { id: created.id },
      //     include: { resultConflictGroup: true, resultConflictDetail: true, resultCard: true, aiNotice: true },
      //   })
      // })
      //
      // return NextResponse.json<ApiResponse<AiJudgmentDto>>({ success: true, data: toAiJudgmentDto(judgment) })

      // AI 모듈 미구현 — 상태 원복 후 503 반환
      await prisma.dispute.update({
        where: { id },
        data: { status: previousStatus },
      })
      statusSetToJudging = false
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: 'AI_NOT_IMPLEMENTED', message: 'AI 판결 모듈이 아직 준비되지 않았습니다.' },
        },
        { status: 503 },
      )
    } catch (aiError) {
      // AI 요청 실패 시 상태 원복
      await prisma.dispute
        .update({ where: { id }, data: { status: 'BOTH_SUBMITTED' } })
        .catch(() => {})
      statusSetToJudging = false

      const isTimeout = aiError instanceof Error && aiError.message.includes('timeout')
      const isParseError = aiError instanceof Error && aiError.message.includes('JSON')

      if (isTimeout) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: { code: 'AI_TIMEOUT', message: 'AI 판결 요청 시간이 초과되었습니다. 다시 시도해주세요.' },
          },
          { status: 504 },
        )
      }

      if (isParseError) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: { code: 'AI_PARSE_ERROR', message: 'AI 응답을 처리하는 중 오류가 발생했습니다.' },
          },
          { status: 502 },
        )
      }

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: 'AI_REQUEST_FAILED', message: 'AI 판결 생성에 실패했습니다. 다시 시도해주세요.' },
        },
        { status: 502 },
      )
    }
  } catch {
    // 외부 catch에서도 JUDGING 상태가 남아있으면 원복
    if (statusSetToJudging) {
      await prisma.dispute
        .update({ where: { id }, data: { status: 'BOTH_SUBMITTED' } })
        .catch(() => {})
    }
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
