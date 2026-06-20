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

async function clearDuplicateKakaoId(kakaoId: string, currentUserId: string): Promise<void> {
  const existing = await prisma.user.findUnique({
    where: { kakaoId },
    select: { id: true },
  })
  if (existing && existing.id !== currentUserId) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { kakaoId: null },
    })
  }
}

async function saveFirstLoginFields(userId: string, kakaoId: string, imageUrl?: string | null): Promise<void> {
  const now = new Date()

  await clearDuplicateKakaoId(kakaoId, userId)

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  })

  if (user?.name) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { kakaoId, termsAgreedAt: now, ...(imageUrl ? { profileImageUrl: imageUrl } : {}) },
      }),
      prisma.userTermsAgreement.createMany({
        data: Object.values(CURRENT_TERMS_VERSIONS).map((terms) => ({
          userId,
          termsType: terms.type,
          termsVersion: terms.version,
          isRequired: terms.isRequired,
          agreedAt: now,
        })),
        skipDuplicates: true,
      }),
    ])
    return
  }

  for (let attempt = 0; attempt < MAX_NICKNAME_RETRIES; attempt++) {
    const isLastAttempt = attempt === MAX_NICKNAME_RETRIES - 1
    const nickname = isLastAttempt
      ? generateFallbackNickname()
      : generateNickname()

    try {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { kakaoId, nickname, termsAgreedAt: now, ...(imageUrl ? { profileImageUrl: imageUrl } : {}) },
        }),
        prisma.userTermsAgreement.createMany({
          data: Object.values(CURRENT_TERMS_VERSIONS).map((terms) => ({
            userId,
            termsType: terms.type,
            termsVersion: terms.version,
            isRequired: terms.isRequired,
            agreedAt: now,
          })),
          skipDuplicates: true,
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
          select: { kakaoId: true, profileImageUrl: true },
        })

        if (!existing?.kakaoId) {
          await saveFirstLoginFields(user.id, account.providerAccountId, user.image)
        } else if (!existing.profileImageUrl && user.image) {
          // 기존 유저 중 profileImageUrl 미저장 상태면 카카오 이미지로 채움
          await prisma.user.update({
            where: { id: user.id },
            data: { profileImageUrl: user.image },
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
  events: {
    async createUser({ user }) {
      const account = await prisma.account.findFirst({
        where: { userId: user.id, provider: 'kakao' },
        select: { providerAccountId: true },
      })

      if (account) {
        await saveFirstLoginFields(user.id, account.providerAccountId, user.image)
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
