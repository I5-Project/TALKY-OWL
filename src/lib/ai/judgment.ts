import { GoogleGenerativeAI } from '@google/generative-ai'

const MODEL_NAME = 'gemini-2.5-flash'

const CATEGORY_GROUP_KO: Record<string, string> = {
  ROMANCE: '연애',
  FAMILY: '가족',
  FRIEND: '친구',
  WORK: '직장',
}

// ============================================================
// Types
// ============================================================

export interface DisputeMetaResult {
  title: string
  summary: string
  modelName: string
}

export interface ConflictTypeOption {
  code: string
  name: string
}

export interface JudgmentInput {
  categoryGroup: string
  statementA: string
  statementB?: string
  conflictTypes: ConflictTypeOption[]
}

export interface JudgmentResult {
  summary: string
  scoreA: number
  scoreB: number
  moreResponsibleRole: 'ROLE_A' | 'ROLE_B' | 'EQUAL' | null
  aFault: string | null
  bFault: string | null
  aSuggestedLine: string | null
  bSuggestedLine: string | null
  conflictTypeCode: string
  modelName: string
}

// ============================================================
// Step 1: 진술 저장 시 — title / summary 추출
// ============================================================

const META_PROMPT = `당신은 한국어 갈등 조정 서비스 TALKY-OWL의 AI입니다.
사용자가 작성한 갈등 진술을 바탕으로 사건 제목과 요약을 추출하세요.

갈등 진술:
<statement>
{statement}
</statement>

아래 JSON만 반환하세요. 설명이나 마크다운 없이 JSON만 출력하세요.

{
  "title": "사건을 한 줄로 표현하는 제목 (30자 이내)",
  "summary": "갈등 상황을 중립적으로 요약한 문장 (100자 이내, 당사자를 '상대방'으로 지칭)"
}`

export async function extractDisputeMeta(statement: string): Promise<DisputeMetaResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: MODEL_NAME })

  const prompt = META_PROMPT.replace('{statement}', statement)
  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('JSON')

  let parsed: { title?: unknown; summary?: unknown }
  try {
    parsed = JSON.parse(jsonMatch[0])
  } catch {
    throw new Error('JSON')
  }

  if (typeof parsed.title !== 'string' || typeof parsed.summary !== 'string') {
    throw new Error('JSON')
  }

  return {
    title: parsed.title.slice(0, 30),
    summary: parsed.summary.slice(0, 100),
    modelName: MODEL_NAME,
  }
}

// ============================================================
// Step 2: 판결 받기 시 — 전체 판결 JSON 추출
// ============================================================

const JUDGMENT_PROMPT_SOLO = `당신은 한국어 갈등 조정 서비스 TALKY-OWL의 AI 판사입니다.
아래는 1인 진술 기반 단독 판결 요청입니다. A측 진술만 제공됩니다.

카테고리: {categoryGroup}

[A측 진술]
{statementA}

사용 가능한 갈등 유형 목록:
{conflictTypes}

아래 JSON만 반환하세요. 설명이나 마크다운 없이 JSON만 출력하세요.

{
  "summary": "갈등 핵심 쟁점 요약 (100자 이내)",
  "aFault": "A측 표현이나 태도에서 개선할 점 (100자 이내)",
  "aSuggestedLine": "A측이 상대방에게 전달할 수 있는 화해 멘트 (100자 이내, 1인칭)",
  "conflictType": {
    "code": "위 목록에서 가장 적합한 code",
    "name": "해당 유형의 name"
  }
}`

const JUDGMENT_PROMPT_DUO = `당신은 한국어 갈등 조정 서비스 TALKY-OWL의 AI 판사입니다.
아래는 양측 진술 기반 1:1 판결 요청입니다.

카테고리: {categoryGroup}

[A측 진술]
{statementA}

[B측 진술]
{statementB}

사용 가능한 갈등 유형 목록:
{conflictTypes}

아래 JSON만 반환하세요. 설명이나 마크다운 없이 JSON만 출력하세요.

{
  "summary": "갈등 핵심 쟁점 요약 (100자 이내)",
  "scoreA": A측 책임 비율 (0~100 정수, A+B=100),
  "scoreB": B측 책임 비율 (0~100 정수, A+B=100),
  "moreResponsibleRole": "ROLE_A" | "ROLE_B" | "EQUAL",
  "aFault": "A측 표현이나 태도에서 개선할 점 (100자 이내)",
  "bFault": "B측 표현이나 태도에서 개선할 점 (100자 이내)",
  "aSuggestedLine": "A측이 B에게 전달할 수 있는 화해 멘트 (100자 이내, 1인칭)",
  "bSuggestedLine": "B측이 A에게 전달할 수 있는 화해 멘트 (100자 이내, 1인칭)",
  "conflictType": {
    "code": "위 목록에서 가장 적합한 code",
    "name": "해당 유형의 name"
  }
}`

const MAX_SCORE_RETRIES = 2

async function callJudgmentAi(
  model: ReturnType<InstanceType<typeof GoogleGenerativeAI>['getGenerativeModel']>,
  prompt: string,
): Promise<Record<string, unknown>> {
  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('JSON')

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(jsonMatch[0])
  } catch {
    throw new Error('JSON')
  }

  const conflictType = parsed.conflictType as { code?: unknown } | undefined
  if (typeof parsed.summary !== 'string' || typeof conflictType?.code !== 'string') {
    throw new Error('JSON')
  }

  return parsed
}

export async function generateAiJudgment(input: JudgmentInput): Promise<JudgmentResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: MODEL_NAME })

  const isSolo = !input.statementB || input.statementB.trim() === ''
  const conflictTypesText = input.conflictTypes
    .map((t) => `- ${t.code}: ${t.name}`)
    .join('\n')
  const categoryKo = CATEGORY_GROUP_KO[input.categoryGroup.toUpperCase()] ?? input.categoryGroup

  const prompt = (isSolo ? JUDGMENT_PROMPT_SOLO : JUDGMENT_PROMPT_DUO)
    .replace('{categoryGroup}', categoryKo)
    .replace('{statementA}', input.statementA)
    .replace('{statementB}', input.statementB ?? '')
    .replace('{conflictTypes}', conflictTypesText)

  const parsed = await callJudgmentAi(model, prompt)
  const conflictType = parsed.conflictType as { code: string }

  if (isSolo) {
    return {
      summary: parsed.summary as string,
      scoreA: 0,
      scoreB: 0,
      moreResponsibleRole: null,
      aFault: typeof parsed.aFault === 'string' ? parsed.aFault : null,
      bFault: null,
      aSuggestedLine: typeof parsed.aSuggestedLine === 'string' ? parsed.aSuggestedLine : null,
      bSuggestedLine: null,
      conflictTypeCode: conflictType.code,
      modelName: MODEL_NAME,
    }
  }

  // 2인 판결: scoreA + scoreB === 100 검증, 불일치 시 재시도
  let attempt = parsed
  let rawA = typeof attempt.scoreA === 'number' ? Math.round(attempt.scoreA) : 0
  let rawB = typeof attempt.scoreB === 'number' ? Math.round(attempt.scoreB) : 0

  for (let retry = 0; retry < MAX_SCORE_RETRIES && rawA + rawB !== 100; retry++) {
    console.warn(`[judgment] scoreA+scoreB=${rawA + rawB} ≠ 100, retry ${retry + 1}/${MAX_SCORE_RETRIES}`)
    attempt = await callJudgmentAi(model, prompt)
    rawA = typeof attempt.scoreA === 'number' ? Math.round(attempt.scoreA) : 0
    rawB = typeof attempt.scoreB === 'number' ? Math.round(attempt.scoreB) : 0
  }

  // 재시도 후에도 합산이 100이 아니면 수학적 정규화
  let scoreA = rawA
  let scoreB = rawB
  if (scoreA + scoreB !== 100) {
    const total = scoreA + scoreB || 100
    scoreA = Math.round((scoreA / total) * 100)
    scoreB = 100 - scoreA
  }

  const finalConflictType = attempt.conflictType as { code: string }

  return {
    summary: attempt.summary as string,
    scoreA,
    scoreB,
    moreResponsibleRole:
      attempt.moreResponsibleRole === 'ROLE_A' || attempt.moreResponsibleRole === 'ROLE_B' || attempt.moreResponsibleRole === 'EQUAL'
        ? attempt.moreResponsibleRole
        : null,
    aFault: typeof attempt.aFault === 'string' ? attempt.aFault : null,
    bFault: typeof attempt.bFault === 'string' ? attempt.bFault : null,
    aSuggestedLine: typeof attempt.aSuggestedLine === 'string' ? attempt.aSuggestedLine : null,
    bSuggestedLine: typeof attempt.bSuggestedLine === 'string' ? attempt.bSuggestedLine : null,
    conflictTypeCode: finalConflictType.code,
    modelName: MODEL_NAME,
  }
}
