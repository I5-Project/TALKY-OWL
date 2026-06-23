import { prisma } from '@/lib/db'

export async function getOrCreateSession(userId: string) {
  const existing = await prisma.chatSession.findFirst({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  })

  if (existing) return existing

  return prisma.chatSession.create({
    data: { userId },
  })
}

export async function getSessionMessages(sessionId: string) {
  return prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  })
}

export async function saveMessage(
  sessionId: string,
  role: 'user' | 'bot',
  content: string
) {
  const [message] = await prisma.$transaction([
    prisma.chatMessage.create({
      data: { sessionId, role, content },
    }),
    prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    }),
  ])

  return message
}

export async function clearSession(userId: string) {
  const session = await prisma.chatSession.findFirst({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  })

  if (!session) return

  await prisma.chatMessage.deleteMany({
    where: { sessionId: session.id },
  })
}
