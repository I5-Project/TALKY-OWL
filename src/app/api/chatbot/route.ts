import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSessionUserId } from '@/lib/auth/session'
import { getChatbotResponse } from '@/lib/ai/chatbot'
import {
  getOrCreateSession,
  getSessionMessages,
  saveMessage,
  clearSession,
} from '@/domains/common/chatbot.service'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = getSessionUserId(session)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { message } = body as { message: string }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '메시지를 입력해주세요.' },
        { status: 400 }
      )
    }

    if (message.length > 500) {
      return NextResponse.json(
        { success: false, error: '메시지는 500자 이내로 입력해주세요.' },
        { status: 400 }
      )
    }

    const chatSession = await getOrCreateSession(userId)
    const dbMessages = await getSessionMessages(chatSession.id)

    const history = dbMessages.map((m) => ({
      role: m.role === 'USER' ? 'user' as const : 'bot' as const,
      content: m.content,
    }))

    await saveMessage(chatSession.id, 'user', message.trim())

    const reply = await getChatbotResponse(message.trim(), history)

    await saveMessage(chatSession.id, 'bot', reply)

    return NextResponse.json({ success: true, data: { reply } })
  } catch (error) {
    console.error('[Chatbot API Error]', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { success: false, error: '답변 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = getSessionUserId(session)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const chatSession = await getOrCreateSession(userId)
    const messages = await getSessionMessages(chatSession.id)

    const data = messages.map((m) => ({
      role: m.role === 'USER' ? 'user' : 'bot',
      content: m.content,
      timestamp: m.createdAt.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }))

    return NextResponse.json({ success: true, data: { messages: data } })
  } catch (error) {
    console.error('[Chatbot API Error]', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { success: false, error: '대화 내역을 불러오지 못했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    const userId = getSessionUserId(session)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    await clearSession(userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Chatbot API Error]', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { success: false, error: '대화 초기화에 실패했습니다.' },
      { status: 500 }
    )
  }
}
