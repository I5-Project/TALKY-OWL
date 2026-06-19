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

export async function generateAiJudgment(input: JudgmentInput): Promise<JudgmentResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: MODEL_NAME })

  const isSolo = !input.statementB
  const conflictTypesText = input.conflictTypes
    .map((t) => `- ${t.code}: ${t.name}`)
    .join('\n')
  const categoryKo = CATEGORY_GROUP_KO[input.categoryGroup.toUpperCase()] ?? input.categoryGroup

  const prompt = (isSolo ? JUDGMENT_PROMPT_SOLO : JUDGMENT_PROMPT_DUO)
    .replace('{categoryGroup}', categoryKo)
    .replace('{statementA}', input.statementA)
    .replace('{statementB}', input.statementB ?? '')
    .replace('{conflictTypes}', conflictTypesText)

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

  const conflictType = parsed.conflictType as { code?: unknown; name?: unknown } | undefined

  if (typeof parsed.summary !== 'string' || typeof conflictType?.code !== 'string') {
    throw new Error('JSON')
  }

  if (isSolo) {
    return {
      summary: parsed.summary,
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

  return {
    summary: parsed.summary,
    scoreA: typeof parsed.scoreA === 'number' ? Math.round(parsed.scoreA) : 0,
    scoreB: typeof parsed.scoreB === 'number' ? Math.round(parsed.scoreB) : 0,
    moreResponsibleRole:
      parsed.moreResponsibleRole === 'ROLE_A' || parsed.moreResponsibleRole === 'ROLE_B' || parsed.moreResponsibleRole === 'EQUAL'
        ? parsed.moreResponsibleRole
        : null,
    aFault: typeof parsed.aFault === 'string' ? parsed.aFault : null,
    bFault: typeof parsed.bFault === 'string' ? parsed.bFault : null,
    aSuggestedLine: typeof parsed.aSuggestedLine === 'string' ? parsed.aSuggestedLine : null,
    bSuggestedLine: typeof parsed.bSuggestedLine === 'string' ? parsed.bSuggestedLine : null,
    conflictTypeCode: conflictType.code,
    modelName: MODEL_NAME,
  }
}
