import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import ConflictTypeClient from './ConflictTypeClient'
import type { ConflictTypePublicDto } from '@/app/api/disputes/[id]/conflict-type/route'

type Props = { params: Promise<{ id: string }> }

async function getConflictType(id: string): Promise<ConflictTypePublicDto | null> {
  const dispute = await prisma.dispute.findFirst({
    where: {
      id,
      deletedAt: null,
      status: { in: ['JUDGED', 'CLOSED'] },
    },
    select: {
      aiJudgment: {
        select: {
          resultConflictDetail: {
            select: { displayName: true, description: true, card_image_url: true },
          },
        },
      },
    },
  })

  if (!dispute?.aiJudgment?.resultConflictDetail) return null
  const { displayName, description, card_image_url } = dispute.aiJudgment.resultConflictDetail
  return { displayName, description, cardImageUrl: card_image_url }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const data = await getConflictType(id)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  const title = data ? `나의 갈등 유형 — ${data.displayName}` : '갈등 유형 결과'
  const description = data?.description ?? '나의 갈등 판결 유형을 확인해봐요!'
  const imageUrl = data?.cardImageUrl ?? `${baseUrl}/images/common/ogimg.jpg`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function ConflictTypePage({ params }: Props) {
  const { id } = await params
  const data = await getConflictType(id)

  return <ConflictTypeClient disputeId={id} data={data} />
}
