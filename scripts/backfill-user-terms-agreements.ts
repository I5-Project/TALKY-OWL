/**
 * 기존 유저 약관 동의 데이터 backfill 스크립트
 *
 * 실행: npx tsx scripts/backfill-user-terms-agreements.ts
 *
 * users.terms_agreed_at이 존재하지만 user_terms_agreements 레코드가 없는 유저 대상으로
 * service, privacy 약관 동의 레코드를 일괄 생성합니다.
 */
import { PrismaClient, TermsType } from '@prisma/client'

const prisma = new PrismaClient()

const INITIAL_TERMS_VERSION = '2026-06-18'

async function main() {
  const usersWithoutAgreements = await prisma.user.findMany({
    where: {
      termsAgreedAt: { not: null },
      termsAgreements: { none: {} },
    },
    select: { id: true, termsAgreedAt: true },
  })

  console.log(`backfill 대상 유저 수: ${usersWithoutAgreements.length}`)

  if (usersWithoutAgreements.length === 0) {
    console.log('backfill 대상 없음. 종료.')
    return
  }

  const records = usersWithoutAgreements.flatMap((user) => [
    {
      userId: user.id,
      termsType: TermsType.SERVICE,
      termsVersion: INITIAL_TERMS_VERSION,
      isRequired: true,
      agreedAt: user.termsAgreedAt!,
    },
    {
      userId: user.id,
      termsType: TermsType.PRIVACY,
      termsVersion: INITIAL_TERMS_VERSION,
      isRequired: true,
      agreedAt: user.termsAgreedAt!,
    },
  ])

  const result = await prisma.userTermsAgreement.createMany({
    data: records,
    skipDuplicates: true,
  })

  console.log(`생성된 레코드 수: ${result.count}`)
  console.log('backfill 완료.')
}

main()
  .catch((e) => {
    console.error('backfill 실패:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
