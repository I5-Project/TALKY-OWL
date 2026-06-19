import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSessionUserId } from '@/lib/auth/session'
import { supabaseAdmin, PROFILE_IMAGES_BUCKET } from '@/lib/storage'
import type { ApiResponse } from '@/types/common'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']

function hasAllowedImageSignature(bytes: Uint8Array): boolean {
  const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  const isPng =
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  const isWebp =
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  const isSvg =
    bytes.length >= 5 &&
    bytes[0] === 0x3c &&
    (bytes[1] === 0x3f || bytes[1] === 0x73 || bytes[1] === 0x53)
  return isJpeg || isPng || isWebp || isSvg
}

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

    const bytes = new Uint8Array(await file.arrayBuffer())
    if (!hasAllowedImageSignature(bytes)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'INVALID_FILE_TYPE', message: 'JPG, PNG, WEBP 파일만 업로드 가능합니다.' } },
        { status: 400 },
      )
    }

    const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1]
    const filePath = `${userId}/profile.${ext}`

    const buffer = Buffer.from(bytes)

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

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { profileImageUrl },
      })
    } catch (dbError) {
      await supabaseAdmin.storage.from(PROFILE_IMAGES_BUCKET).remove([filePath])
      throw dbError
    }

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
