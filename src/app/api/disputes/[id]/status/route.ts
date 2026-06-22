import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getRequestUserId } from '@/lib/auth/session'
import type { ApiResponse } from '@/types/common'
import type { DisputeStatus } from '@/types/dispute'

const ALLOWED_STATUSES = ['closed', 'waiting_opponent', 'both_submitted'] as const

const statusSchema = z.object({
  status: z.enum(ALLOWED_STATUSES, {
    errorMap: () => ({ message: '허용되지 않는 상태값입니다.' }),
  }),
})

// PATCH /api/disputes/:id/status
// dispute status 변경. 참여자만 가능.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getRequestUserId(request)
  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    )
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INVALID_REQUEST', message: '요청 본문을 파싱할 수 없습니다.' } },
      { status: 400 },
    )
  }

  const parsed = statusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0]?.message ?? '입력값이 올바르지 않습니다.' } },
      { status: 400 },
    )
  }

  const { status: newStatus } = parsed.data

  try {
    const [participant, dispute] = await Promise.all([
      prisma.disputeParticipant.findFirst({ where: { disputeId: id, userId } }),
      prisma.dispute.findFirst({ where: { id, deletedAt: null } }),
    ])

    if (!dispute) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'DISPUTE_NOT_FOUND', message: '사건을 찾을 수 없습니다.' } },
        { status: 404 },
      )
    }

    if (!participant) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'FORBIDDEN', message: '해당 사건의 참여자가 아닙니다.' } },
        { status: 403 },
      )
    }

    // 이미 목표 상태면 멱등 성공 반환
    if (dispute.status === newStatus.toUpperCase()) {
      return NextResponse.json<ApiResponse<{ status: DisputeStatus }>>({
        success: true,
        data: { status: dispute.status.toLowerCase() as DisputeStatus },
      })
    }

    const terminalStatuses = ['JUDGED', 'CLOSED', 'DELETED', 'EXPIRED']
    if (terminalStatuses.includes(dispute.status)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'DISPUTE_NOT_MODIFIABLE', message: '이미 종료된 사건입니다.' } },
        { status: 409 },
      )
    }

    const updated = await prisma.dispute.update({
      where: { id },
      data: { status: newStatus.toUpperCase() as Uppercase<typeof newStatus> },
    })

    return NextResponse.json<ApiResponse<{ status: DisputeStatus }>>({
      success: true,
      data: { status: updated.status.toLowerCase() as DisputeStatus },
    })
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
