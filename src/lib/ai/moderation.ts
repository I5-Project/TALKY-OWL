import { GoogleGenerativeAI } from '@google/generative-ai'

export interface ModerationResult {
  isBlocked: boolean
  reason: string | null
  confidenceScore: number
  hasPersonalInfo: boolean
  durationMs: number
  modelName: string
}

const MODEL_FALLBACKS = ['gemini-2.0-flash-lite', 'gemini-2.5-flash', 'gemini-1.5-flash']

function isFallbackable(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return (
    msg.includes('503') ||
    msg.includes('Service Unavailable') ||
    msg.includes('high demand') ||
    msg.includes('404') ||
    msg.includes('Not Found') ||
    msg.includes('no longer available')
  )
}

const PROMPT_TEMPLATE = `You are a content moderation AI for a Korean conflict resolution service called TALKY-OWL.
Users submit personal dispute statements in Korean.

Analyze the statement below for inappropriate content.

Statement:
<statement>
{content}
</statement>

Return ONLY a valid JSON object. No explanation, no markdown.

{
  "isBlocked": boolean,
  "reason": string | null,
  "confidenceScore": number,
  "hasPersonalInfo": boolean
}

Blocking rules (isBlocked: true):
- 욕설/비속어: clear profanity or vulgar language
- 혐오 발언: hate speech targeting gender, race, religion, nationality, etc.
- 성적으로 부적절한 표현: sexually explicit content
- 폭력적 위협: direct violent threats toward a specific person

Conservative standard:
- Emotionally charged but non-abusive conflict descriptions → do NOT block
- Criticism, complaints, accusations without profanity → do NOT block
- When uncertain, do NOT block

Personal info rules (hasPersonalInfo, never affects isBlocked):
- hasPersonalInfo: true if phone numbers, addresses, resident registration numbers, bank account numbers, or similar sensitive identifiers are detected
- Names, titles, or relationship terms (남자친구, 상사, 친구) → hasPersonalInfo: false

reason:
- If isBlocked: brief Korean explanation of why, max 255 chars
- If not blocked: null`

export async function moderateContent(content: string): Promise<ModerationResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured')

  const genAI = new GoogleGenerativeAI(apiKey)
  const prompt = PROMPT_TEMPLATE.replace('{content}', content)
  const startTime = Date.now()

  let lastErr: unknown
  for (const modelName of MODEL_FALLBACKS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent(prompt)
      const durationMs = Date.now() - startTime
      const text = result.response.text().trim()

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Gemini moderation returned invalid JSON')

      let parsed: { isBlocked?: unknown; reason?: unknown; confidenceScore?: unknown; hasPersonalInfo?: unknown }
      try {
        parsed = JSON.parse(jsonMatch[0])
      } catch {
        throw new Error('Gemini moderation returned unparseable JSON')
      }

      return {
        isBlocked: Boolean(parsed.isBlocked),
        reason: typeof parsed.reason === 'string' ? parsed.reason.slice(0, 255) : null,
        confidenceScore: Math.min(1, Math.max(0, Number(parsed.confidenceScore) || 0)),
        hasPersonalInfo: Boolean(parsed.hasPersonalInfo),
        durationMs,
        modelName,
      }
    } catch (err) {
      if (isFallbackable(err)) {
        console.warn(`[moderation] ${modelName} unavailable, trying next model...`)
        lastErr = err
        continue
      }
      throw err
    }
  }

  throw lastErr
}
