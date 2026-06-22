import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSessionUserId } from '@/lib/auth/session'
import { toAiJudgmentDto } from '@/domains/judgement/judgment.mapper'
import type { ApiResponse } from '@/types/common'
import type { AiJudgmentDto } from '@/types/judgment'

// GET /api/disputes/:id/result
// 판결 결과 조회. 해당 dispute의 참여자(role_a / role_b)만 접근 가능
export async function GET(
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

  try {
    // dispute 조회 + 참여자 권한 확인 + judgment를 단일 쿼리로 처리
    const dispute = await prisma.dispute.findFirst({
      where: {
        id,
        deletedAt: null,
        participants: { some: { userId } },
      },
      select: {
        status: true,
        aiJudgment: {
          include: {
            resultConflictDetail: true,
            resultCard: true,
            aiNotice: true,
          },
        },
      },
    })

    if (!dispute) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'DISPUTE_NOT_FOUND', message: '사건을 찾을 수 없습니다.' } },
        { status: 404 },
      )
    }

    if (dispute.status === 'JUDGING') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'JUDGMENT_IN_PROGRESS',
            message: 'AI 판결이 진행 중입니다. 잠시 후 다시 확인해주세요.',
          },
        },
        { status: 202 },
      )
    }

    if (dispute.status !== 'JUDGED') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'JUDGMENT_NOT_READY',
            message: '아직 판결 결과가 없습니다.',
            details: `현재 사건 상태: ${dispute.status.toLowerCase()}`,
          },
        },
        { status: 404 },
      )
    }

    const judgment = dispute.aiJudgment
    if (!judgment) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: 'JUDGMENT_NOT_FOUND', message: '판결 결과를 찾을 수 없습니다.' },
        },
        { status: 404 },
      )
    }

    return NextResponse.json<ApiResponse<AiJudgmentDto>>({
      success: true,
      data: toAiJudgmentDto(judgment),
    })
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
