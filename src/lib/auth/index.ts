import type { NextAuthOptions } from 'next-auth'
import KakaoProvider from 'next-auth/providers/kakao'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import { generateNickname, generateFallbackNickname } from './nickname'

const MAX_NICKNAME_RETRIES = 10

async function saveFirstLoginFields(userId: string, kakaoId: string): Promise<void> {
  for (let attempt = 0; attempt < MAX_NICKNAME_RETRIES; attempt++) {
    const isLastAttempt = attempt === MAX_NICKNAME_RETRIES - 1
    const nickname = isLastAttempt
      ? generateFallbackNickname()
      : generateNickname()

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { kakaoId, nickname, termsAgreedAt: new Date() },
      })
      return
    } catch (e) {
      const err = e as { code?: string; meta?: { target?: string[] } }
      if (err.code === 'P2002' && err.meta?.target?.includes('nickname')) {
        continue
      }
      throw e
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  session: { strategy: 'jwt' },
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'kakao' && user.id) {
        const existing = await prisma.user.findUnique({
          where: { id: user.id },
          select: { kakaoId: true },
        })

        // kakaoId가 없으면 최초 로그인 → 커스텀 필드 설정 (닉네임 충돌 시 재시도)
        if (!existing?.kakaoId) {
          await saveFirstLoginFields(user.id, account.providerAccountId)
        }
      }

      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
