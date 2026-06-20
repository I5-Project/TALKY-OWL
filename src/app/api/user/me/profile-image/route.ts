import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSessionUserId } from '@/lib/auth/session'
import { supabaseAdmin, PROFILE_IMAGES_BUCKET } from '@/lib/storage'
import type { ApiResponse } from '@/types/common'

export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)

  if (!userId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NO_FILE', message: '파일이 없습니다.' } },
        { status: 400 },
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'INVALID_FILE_TYPE', message: 'JPG, PNG, WEBP 파일만 업로드 가능합니다.' } },
        { status: 400 },
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'FILE_TOO_LARGE', message: '파일 크기는 5MB 이하만 가능합니다.' } },
        { status: 400 },
      )
    }

    const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1]
    const filePath = `${userId}/profile.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabaseAdmin.storage
      .from(PROFILE_IMAGES_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('[user/me/profile-image] upload error', { message: uploadError.message })
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'UPLOAD_FAILED', message: '이미지 업로드에 실패했습니다.' } },
        { status: 500 },
      )
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(PROFILE_IMAGES_BUCKET)
      .getPublicUrl(filePath)

    const profileImageUrl = `${urlData.publicUrl}?t=${Date.now()}`

    await prisma.user.update({
      where: { id: userId },
      data: { profileImageUrl },
    })

    return NextResponse.json<ApiResponse<{ profileImageUrl: string }>>({
      success: true,
      data: { profileImageUrl },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[user/me/profile-image] POST error', { message })
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 },
    )
  }
}
