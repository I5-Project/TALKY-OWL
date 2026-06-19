import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSessionUserId } from '@/lib/auth/session'
import type { ApiResponse } from '@/types/common'
import type { UserMeDto, PatchUserBody } from '@/types/user'
import { VALID_MBTI } from '@/types/user'

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)

  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, nickname: true, mbti: true },
    })

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'USER_NOT_FOUND', message: '사용자를 찾을 수 없습니다.' } },
        { status: 404 },
      )
    }

    return NextResponse.json<ApiResponse<UserMeDto>>({
      success: true,
      data: { id: user.id, name: user.name, nickname: user.nickname, mbti: user.mbti },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[user/me] GET error', { message })
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)

  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    )
  }

  try {
    const body = (await request.json()) as PatchUserBody
    const data: Record<string, string | null> = {}
    const fieldErrors: { field: string; code: string; message: string }[] = []

    if (body.name !== undefined) {
      const trimmed = body.name.trim()
      if (!trimmed || trimmed.length < 1 || trimmed.length > 50) {
        fieldErrors.push({ field: 'name', code: 'INVALID_NAME', message: '이름은 1~50자로 입력해주세요.' })
      } else {
        data.name = trimmed
      }
    }

    if (body.nickname !== undefined) {
      const trimmed = body.nickname.trim()
      if (!trimmed || trimmed.length < 2 || trimmed.length > 20) {
        fieldErrors.push({ field: 'nickname', code: 'INVALID_NICKNAME', message: '닉네임은 2~20자로 입력해주세요.' })
      } else {
        data.nickname = trimmed
      }
    }

    if (body.mbti !== undefined) {
      if (body.mbti === null || body.mbti === '') {
        data.mbti = null
      } else if (!(VALID_MBTI as readonly string[]).includes(body.mbti.toUpperCase())) {
        fieldErrors.push({ field: 'mbti', code: 'INVALID_MBTI', message: '올바른 MBTI를 선택해주세요.' })
      } else {
        data.mbti = body.mbti.toUpperCase()
      }
    }

    if (fieldErrors.length > 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '입력값을 확인해주세요.', fieldErrors } },
        { status: 400 },
      )
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NO_CHANGES', message: '변경할 항목이 없습니다.' } },
        { status: 400 },
      )
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      select: { id: true, name: true, nickname: true, mbti: true },
      data,
    })

    return NextResponse.json<ApiResponse<UserMeDto>>({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        nickname: updated.nickname,
        mbti: updated.mbti,
      },
    })
  } catch (error) {
    const err = error as { code?: string; meta?: { target?: string[] } }
    if (err.code === 'P2002' && err.meta?.target?.includes('nickname')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'DUPLICATE_NICKNAME', message: '이미 사용 중인 닉네임입니다.' } },
        { status: 409 },
      )
    }

    const message = error instanceof Error ? error.message : String(error)
    console.error('[user/me] PATCH error', { message })
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
