import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ConflictTypeGroup 마스터 데이터
  // docs/db/MASTER_DATA.md 기준으로 작성
  // TODO: 실제 seed 데이터 작성 필요
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
