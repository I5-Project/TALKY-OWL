import { GoogleGenerativeAI } from '@google/generative-ai'

const MODEL_FALLBACKS = ['gemini-2.5-flash', 'gemini-2.5-pro']
const MAX_RETRIES_PER_MODEL = 2
const RETRY_DELAY_MS = 1500
const REQUEST_TIMEOUT_MS = 30000

const SYSTEM_PROMPT = `당신은 "부엉봇" AI 갈등 조정 판결 서비스의 고객문의 챗봇입니다.
친절하고 간결하게 답변해주세요. 존댓말을 사용하세요.

## 서비스 안내 범위

### 서비스 이용방법
- 부엉봇은 AI 기반 갈등 조정 판결 서비스입니다.
- 갈등 상황을 작성하고 AI 판결을 받을 수 있습니다.
- 단독 판결: 혼자 진술을 작성하고 AI 판결을 받습니다. (제한적 결과 제공)
- 1:1 판결: 상대방을 초대하여 양측 진술 기반으로 AI 판결을 받습니다. (전체 결과 제공)

### 판결 절차
- 방 생성 → 진술 작성 → AI 판결 생성 → 결과 확인
- 1:1 판결 시: 방 생성 → 초대 링크 발급 → 상대방 참여 → 양측 진술 → AI 판결
- 판결 결과에는 판결 점수, 핵심 쟁점, 판결 근거, 화해 제안 등이 포함됩니다.

### 카테고리
- 연애, 가족, 친구, 직장 4가지 카테고리에서 갈등 상황을 작성할 수 있습니다.

### 계정
- 카카오 로그인으로 이용할 수 있습니다.
- 마이페이지에서 프로필 수정, 회원탈퇴가 가능합니다.

### 감정일기
- 매일의 감정을 기록할 수 있는 기능입니다.
- 감정일기는 본인만 볼 수 있으며 다른 사용자에게 공개되지 않습니다.

### 결과 확인
- 판결 결과는 사건기록에서 다시 확인할 수 있습니다.
- 결과 카드를 생성하여 공유할 수 있습니다.

## 답변 규칙
- 위 범위 내의 질문에만 답변하세요.
- 서비스와 관련 없는 질문에는 "해당 내용은 안내가 어렵습니다. 서비스 이용 관련 질문을 부탁드려요!" 라고 답변하세요.
- 답변은 3문장 이내로 간결하게 해주세요.
- 기술적 세부사항(API, DB 등)은 답변하지 마세요.`

export interface ChatMessage {
  role: 'user' | 'bot'
  content: string
}

export class ChatbotTimeoutError extends Error {
  constructor() {
    super('Gemini request timed out')
    this.name = 'ChatbotTimeoutError'
  }
}

export class ChatbotGeminiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ChatbotGeminiError'
  }
}

function isRetryable(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return (
    msg.includes('503') ||
    msg.includes('Service Unavailable') ||
    msg.includes('high demand') ||
    msg.includes('429')
  )
}

function shouldFallback(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return (
    msg.includes('404') ||
    msg.includes('Not Found') ||
    msg.includes('no longer available')
  )
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new ChatbotTimeoutError()), ms)
    ),
  ])
}

export async function getChatbotResponse(
  userMessage: string,
  history: ChatMessage[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured')

  const genAI = new GoogleGenerativeAI(apiKey)
  const chatHistory = [
    { role: 'user' as const, parts: [{ text: '시스템 설정' }] },
    { role: 'model' as const, parts: [{ text: SYSTEM_PROMPT }] },
    ...history.map((msg) => ({
      role: msg.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: msg.content }],
    })),
  ]

  let lastError: unknown

  for (const modelName of MODEL_FALLBACKS) {
    for (let attempt = 0; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const chat = model.startChat({ history: chatHistory })
        const result = await withTimeout(chat.sendMessage(userMessage), REQUEST_TIMEOUT_MS)
        return result.response.text()
      } catch (error) {
        lastError = error
        const errMsg = error instanceof Error ? error.message : String(error)

        if (error instanceof ChatbotTimeoutError) throw error

        if (shouldFallback(error)) {
          console.warn(`[chatbot] ${modelName} unavailable: ${errMsg}, switching model...`)
          break
        }

        if (isRetryable(error) && attempt < MAX_RETRIES_PER_MODEL) {
          console.warn(`[chatbot] ${modelName} retry ${attempt + 1}/${MAX_RETRIES_PER_MODEL}: ${errMsg}`)
          await sleep(RETRY_DELAY_MS * (attempt + 1))
          continue
        }

        console.warn(`[chatbot] ${modelName} failed: ${errMsg}`)
        break
      }
    }
  }

  if (lastError instanceof Error) {
    throw new ChatbotGeminiError(lastError.message)
  }
  throw new ChatbotGeminiError('Unknown Gemini error')
}
