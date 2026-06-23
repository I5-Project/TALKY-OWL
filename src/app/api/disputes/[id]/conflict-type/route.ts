import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { ApiResponse } from '@/types/common'

export interface ConflictTypePublicDto {
  displayName: string
  description: string | null
  cardImageUrl: string | null
}

// GET /api/disputes/:id/conflict-type
// 비회원 공개 접근 허용. 유형명·이미지 URL만 반환 (민감 판결 데이터 제외)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const dispute = await prisma.dispute.findFirst({
      where: {
        id,
        deletedAt: null,
        status: { in: ['JUDGED', 'CLOSED'] },
      },
      select: {
        aiJudgment: {
          select: {
            resultConflictDetail: {
              select: {
                displayName: true,
                description: true,
                card_image_url: true,
              },
            },
          },
        },
      },
    })

    if (!dispute?.aiJudgment?.resultConflictDetail) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NOT_FOUND', message: '갈등 유형 결과를 찾을 수 없습니다.' } },
        { status: 404 },
      )
    }

    const { displayName, description, card_image_url } = dispute.aiJudgment.resultConflictDetail

    return NextResponse.json<ApiResponse<ConflictTypePublicDto>>({
      success: true,
      data: { displayName, description, cardImageUrl: card_image_url },
    })
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
