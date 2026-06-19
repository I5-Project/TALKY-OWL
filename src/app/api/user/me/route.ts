import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSessionUserId } from '@/lib/auth/session'
import type { ApiResponse } from '@/types/common'

interface UserMeDto {
  id: string
  email: string | null
  nickname: string | null
  profileImageUrl: string | null
  mbti: string | null
}

const VALID_MBTI = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getAuthErrorResponse() {
  return NextResponse.json<ApiResponse>(
    { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
    { status: 401 },
  )
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)

  if (!userId) return getAuthErrorResponse()

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, nickname: true, profileImageUrl: true, mbti: true },
    })

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'USER_NOT_FOUND', message: '사용자를 찾을 수 없습니다.' } },
        { status: 404 },
      )
    }

    return NextResponse.json<ApiResponse<UserMeDto>>({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profileImageUrl: user.profileImageUrl,
        mbti: user.mbti,
      },
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

interface PatchBody {
  email?: string
  nickname?: string
  mbti?: string | null
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)

  if (!userId) return getAuthErrorResponse()

  try {
    const body = (await request.json()) as PatchBody
    const data: Record<string, string | null> = {}
    const fieldErrors: { field: string; code: string; message: string }[] = []

    if (body.email !== undefined) {
      if (!body.email || !EMAIL_REGEX.test(body.email)) {
        fieldErrors.push({ field: 'email', code: 'INVALID_EMAIL', message: '올바른 이메일 형식이 아닙니다.' })
      } else {
        data.email = body.email
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
      } else if (!VALID_MBTI.includes(body.mbti.toUpperCase())) {
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
      select: { id: true, email: true, nickname: true, profileImageUrl: true, mbti: true },
      data,
    })

    return NextResponse.json<ApiResponse<UserMeDto>>({
      success: true,
      data: {
        id: updated.id,
        email: updated.email,
        nickname: updated.nickname,
        profileImageUrl: updated.profileImageUrl,
        mbti: updated.mbti,
      },
    })
  } catch (error) {
    const err = error as { code?: string; meta?: { target?: string[] } }
    if (err.code === 'P2002') {
      const target = err.meta?.target ?? []
      if (target.includes('nickname')) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: { code: 'DUPLICATE_NICKNAME', message: '이미 사용 중인 닉네임입니다.' } },
          { status: 409 },
        )
      }
      if (target.includes('email')) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: { code: 'DUPLICATE_EMAIL', message: '이미 사용 중인 이메일입니다.' } },
          { status: 409 },
        )
      }
    }

    const message = error instanceof Error ? error.message : String(error)
    console.error('[user/me] PATCH error', { message })
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
