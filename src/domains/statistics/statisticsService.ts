import { prisma } from '@/lib/db'

// 전체 판결 완료 건수 집계
// ai_judgements는 JUDGED 상태에서만 생성되지만, dispute.status = JUDGED를 명시해 의도를 명확히 함
// deletedAt / anonymizedAt 제외: 삭제·익명화된 사건은 통계에서 제외 (CLAUDE.md §7)
export async function getSummary() {
  const totalJudgements = await prisma.aiJudgment.count({
    where: {
      dispute: {
        status: 'JUDGED',
        deletedAt: null,
        anonymizedAt: null,
      },
    },
  })

  return { totalJudgements }
}

// 결과 유형 Top N 집계 + 비율 계산
// 결과 유형은 DB 마스터(conflict_type_details) 기준 — Enum 하드코딩 금지 (CLAUDE.md §3)
export async function getTopTypes(size = 5) {
  // 비율 계산을 위한 전체 판결 완료 건수
  const total = await prisma.aiJudgment.count({
    where: {
      dispute: {
        status: 'JUDGED',
        deletedAt: null,
        anonymizedAt: null,
      },
    },
  })

  // result_conflict_detail_id 기준 GROUP BY + COUNT DESC → 상위 size개
  const grouped = await prisma.aiJudgment.groupBy({
    by: ['resultConflictDetailId'],
    where: {
      dispute: {
        status: 'JUDGED',
        deletedAt: null,
        anonymizedAt: null,
      },
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: size,
  })

  if (grouped.length === 0) {
    return {
      items: [],
      page: { page: 1, size, totalPages: 1, sortBy: 'count', sort: 'desc', hasNext: false, hasPrevious: false },
    }
  }

  // groupBy에는 detailId만 있어 detailCode·displayName 별도 조회
  // prisma.conflictTypeDetail 사용 (conflictDetail은 존재하지 않음)
  const detailIds = grouped.map((g) => g.resultConflictDetailId)
  const details = await prisma.conflictTypeDetail.findMany({
    where: {
      id: { in: detailIds },
      isActive: true, // 비활성화된 유형은 통계 제외
    },
    select: { id: true, detailCode: true, displayName: true },
  })

  const detailMap = new Map(details.map((d) => [d.id, d]))

  const items = grouped
    .filter((g) => detailMap.has(g.resultConflictDetailId))
    .map((g) => {
      const detail = detailMap.get(g.resultConflictDetailId)!
      const count = g._count.id
      // 소수점 1자리 반올림: 0.328 → 32.8%
      const percentage = total > 0 ? Math.round((count / total) * 1000) / 10 : 0
      return { detailCode: detail.detailCode, displayName: detail.displayName, count, percentage }
    })

  return {
    items,
    page: { page: 1, size, totalPages: 1, sortBy: 'count', sort: 'desc', hasNext: false, hasPrevious: false },
  }
}
