import type { NextAuthOptions } from 'next-auth'
import type { Adapter, AdapterAccount } from 'next-auth/adapters'
import KakaoProvider from 'next-auth/providers/kakao'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import { generateNickname, generateFallbackNickname } from './nickname'
import { CURRENT_TERMS_VERSIONS } from '@/domains/auth/constants'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const ACCOUNT_FIELDS = new Set([
  'id', 'userId', 'type', 'provider', 'providerAccountId',
  'refresh_token', 'access_token', 'expires_at', 'token_type',
  'scope', 'id_token', 'session_state',
])

function createAdapter(): Adapter {
  const base = PrismaAdapter(prisma) as Adapter
  return {
    ...base,
    linkAccount: (account: AdapterAccount) => {
      const filtered = Object.fromEntries(
        Object.entries(account).filter(([key]) => ACCOUNT_FIELDS.has(key))
      ) as AdapterAccount
      return base.linkAccount!(filtered)
    },
  }
}

const MAX_NICKNAME_RETRIES = 10

async function saveFirstLoginFields(userId: string, kakaoId: string): Promise<void> {
  const now = new Date()

  for (let attempt = 0; attempt < MAX_NICKNAME_RETRIES; attempt++) {
    const isLastAttempt = attempt === MAX_NICKNAME_RETRIES - 1
    const nickname = isLastAttempt
      ? generateFallbackNickname()
      : generateNickname()

    try {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { kakaoId, nickname, termsAgreedAt: now },
        }),
        prisma.userTermsAgreement.createMany({
          data: Object.values(CURRENT_TERMS_VERSIONS).map((terms) => ({
            userId,
            termsType: terms.type,
            termsVersion: terms.version,
            isRequired: terms.isRequired,
            agreedAt: now,
          })),
        }),
      ])
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
  adapter: createAdapter() as NextAuthOptions['adapter'],
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
