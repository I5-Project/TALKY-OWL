import type { NextAuthOptions } from 'next-auth'
import KakaoProvider from 'next-auth/providers/kakao'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import { generateNickname, generateFallbackNickname } from './nickname'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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
      if (account?.provider === 'kakao' && user.id && UUID_REGEX.test(user.id)) {
        const existing = await prisma.user.findUnique({
          where: { id: user.id },
          select: { kakaoId: true },
        })

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
  events: {
    async createUser({ user }) {
      // PrismaAdapter가 User를 생성한 직후 호출됨 — 신규 사용자 커스텀 필드 설정
      const account = await prisma.account.findFirst({
        where: { userId: user.id, provider: 'kakao' },
        select: { providerAccountId: true },
      })

      if (account) {
        await saveFirstLoginFields(user.id, account.providerAccountId)
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
