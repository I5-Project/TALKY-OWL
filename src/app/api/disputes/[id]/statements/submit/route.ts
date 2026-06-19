import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSessionUserId } from '@/lib/auth/session'
import type { ApiResponse } from '@/types/common'
import type { DisputeStatus, StatementSubmitResponse } from '@/types/dispute'

// POST /api/disputes/:id/statements/submit
// 진술 최종 제출. submittedAt 설정 후 dispute 상태 업데이트. 멱등성 보장.
export async function POST(
  _request: NextRequest,
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

  const { id: disputeId } = await params

  try {
    const participant = await prisma.disputeParticipant.findFirst({
      where: { disputeId, userId },
      include: { statements: true },
    })

    if (!participant) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'FORBIDDEN', message: '해당 사건의 참여자가 아닙니다.' } },
        { status: 403 },
      )
    }

    const statement = participant.statements[0] ?? null

    if (!statement) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NOT_FOUND', message: '제출할 진술이 없습니다.' } },
        { status: 404 },
      )
    }

    // 이미 제출된 경우 멱등성 처리
    if (statement.submittedAt) {
      const dispute = await prisma.dispute.findUniqueOrThrow({ where: { id: disputeId } })
      return NextResponse.json<ApiResponse<StatementSubmitResponse>>({
        success: true,
        data: {
          id: statement.id,
          submittedAt: statement.submittedAt.toISOString(),
          disputeStatus: dispute.status.toLowerCase() as DisputeStatus,
        },
      })
    }

    const newDisputeStatus =
      participant.role === 'ROLE_A' ? ('WAITING_OPPONENT' as const) : ('BOTH_SUBMITTED' as const)

    const [updatedStatement, updatedDispute] = await prisma.$transaction([
      prisma.disputeStatement.update({
        where: { id: statement.id },
        data: { submittedAt: new Date() },
      }),
      prisma.dispute.update({
        where: { id: disputeId },
        data: { status: newDisputeStatus },
      }),
    ])

    return NextResponse.json<ApiResponse<StatementSubmitResponse>>({
      success: true,
      data: {
        id: updatedStatement.id,
        submittedAt: updatedStatement.submittedAt!.toISOString(),
        disputeStatus: updatedDispute.status.toLowerCase() as DisputeStatus,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[disputes/statements/submit] api error', { message })
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
