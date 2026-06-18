import type { NextAuthOptions } from 'next-auth'
import KakaoProvider from 'next-auth/providers/kakao'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import { generateNickname } from './nickname'

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

        // kakaoId가 없으면 최초 로그인 → 커스텀 필드 설정
        if (!existing?.kakaoId) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              kakaoId: account.providerAccountId,
              nickname: generateNickname(),
              termsAgreedAt: new Date(),
            },
          })
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
