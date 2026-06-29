import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getRequestUserId } from '@/lib/auth/session'
import { supabaseAdmin, PROFILE_IMAGES_BUCKET } from '@/lib/storage'
import type { ApiResponse } from '@/types/common'

export const dynamic = 'force-dynamic'

interface UserMeDto {
  id: string
  name: string | null
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

const PROFILE_IMAGE_MAX_SIZE = 5 * 1024 * 1024
const PROFILE_IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']


function getAuthErrorResponse() {
  return NextResponse.json<ApiResponse>(
    { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
    { status: 401 },
  )
}

export async function GET(request: NextRequest) {
  const userId = await getRequestUserId(request)

  if (!userId) return getAuthErrorResponse()

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, nickname: true, profileImageUrl: true, mbti: true },
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
        name: user.name,
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

export async function PATCH(request: NextRequest) {
  const userId = await getRequestUserId(request)

  if (!userId) return getAuthErrorResponse()

  try {
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'INVALID_BODY', message: '요청 본문 형식이 올바르지 않습니다.' } },
        { status: 400 },
      )
    }

    const data: Record<string, string | null> = {}
    const fieldErrors: { field: string; code: string; message: string }[] = []

    const emailValue = formData.get('email')
    if (emailValue !== null) {
      const email = String(emailValue)
      if (!email || !EMAIL_REGEX.test(email)) {
        fieldErrors.push({ field: 'email', code: 'INVALID_EMAIL', message: '올바른 이메일 형식이 아닙니다.' })
      } else {
        data.email = email
      }
    }

    const nicknameValue = formData.get('nickname')
    if (nicknameValue !== null) {
      const trimmed = String(nicknameValue).trim()
      if (!trimmed || trimmed.length < 2 || trimmed.length > 100) {
        fieldErrors.push({ field: 'nickname', code: 'INVALID_NICKNAME', message: '닉네임은 2~100자로 입력해주세요.' })
      } else {
        data.nickname = trimmed
      }
    }

    const mbtiValue = formData.get('mbti')
    if (mbtiValue !== null) {
      const mbti = String(mbtiValue)
      if (mbti === '') {
        data.mbti = null
      } else if (!VALID_MBTI.includes(mbti.toUpperCase())) {
        fieldErrors.push({ field: 'mbti', code: 'INVALID_MBTI', message: '올바른 MBTI를 선택해주세요.' })
      } else {
        data.mbti = mbti.toUpperCase()
      }
    }

    const profileImageFile = formData.get('profileImage') as File | null
    if (profileImageFile) {
      if (!PROFILE_IMAGE_ALLOWED_TYPES.includes(profileImageFile.type)) {
        fieldErrors.push({ field: 'profileImage', code: 'INVALID_FILE_TYPE', message: 'JPG, PNG, WEBP 파일만 업로드 가능합니다.' })
      } else if (profileImageFile.size > PROFILE_IMAGE_MAX_SIZE) {
        fieldErrors.push({ field: 'profileImage', code: 'FILE_TOO_LARGE', message: '파일 크기는 5MB 이하만 가능합니다.' })
      }
    }


    if (fieldErrors.length > 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '입력값을 확인해주세요.', fieldErrors } },
        { status: 400 },
      )
    }

    const hasProfileImage = profileImageFile && !fieldErrors.some((e) => e.field === 'profileImage')

    if (Object.keys(data).length === 0 && !hasProfileImage) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NO_CHANGES', message: '변경할 항목이 없습니다.' } },
        { status: 400 },
      )
    }

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'USER_NOT_FOUND', message: '사용자를 찾을 수 없습니다.' } },
        { status: 404 },
      )
    }

    if (hasProfileImage) {
      const ext = profileImageFile.type.split('/')[1] === 'jpeg' ? 'jpg' : profileImageFile.type.split('/')[1]
      const filePath = `${userId}/profile.${ext}`
      const buffer = Buffer.from(await profileImageFile.arrayBuffer())

      const { error: uploadError } = await supabaseAdmin.storage
        .from(PROFILE_IMAGES_BUCKET)
        .upload(filePath, buffer, { contentType: profileImageFile.type, upsert: true })

      if (uploadError) {
        console.error('[user/me] profile image upload error', { message: uploadError.message })
        return NextResponse.json<ApiResponse>(
          { success: false, error: { code: 'UPLOAD_FAILED', message: '이미지 업로드에 실패했습니다.' } },
          { status: 500 },
        )
      }

      const { data: urlData } = supabaseAdmin.storage
        .from(PROFILE_IMAGES_BUCKET)
        .getPublicUrl(filePath)

      data.profileImageUrl = `${urlData.publicUrl}?t=${Date.now()}`
    }


    const updated = await prisma.user.update({
      where: { id: userId },
      select: { id: true, name: true, email: true, nickname: true, profileImageUrl: true, mbti: true },
      data,
    })

    return NextResponse.json<ApiResponse<UserMeDto>>({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
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

export async function DELETE(request: NextRequest) {
  const userId = await getRequestUserId(request)

  if (!userId) return getAuthErrorResponse()

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, deletedAt: true },
    })

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'USER_NOT_FOUND', message: '사용자를 찾을 수 없습니다.' } },
        { status: 404 },
      )
    }

    if (user.deletedAt) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'ALREADY_DELETED', message: '이미 탈퇴 처리된 계정입니다.' } },
        { status: 409 },
      )
    }

    const now = new Date()

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { deletedAt: now, deletionRequestedAt: now, kakaoId: null },
      }),
      prisma.account.deleteMany({
        where: { userId },
      }),
      prisma.auditLog.create({
        data: {
          eventType: 'USER_DELETED',
          actorUserId: userId,
          targetUserId: userId,
        },
      }),
    ])

    return NextResponse.json<ApiResponse>({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[user/me] DELETE error', { message })
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
