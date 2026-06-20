import type { ApiResponse } from '@/types/common'
import type { AiJudgmentDto } from '@/types/judgment'

async function parseJson<T>(res: Response, fallbackMessage: string): Promise<ApiResponse<T>> {
  const text = await res.text()
  try {
    return JSON.parse(text) as ApiResponse<T>
  } catch {
    throw new Error(res.ok ? fallbackMessage : `서버 오류 (${res.status})`)
  }
}

export async function fetchJudgment(disputeId: string): Promise<AiJudgmentDto> {
  const res = await fetch(`/api/disputes/${disputeId}/result`)
  const json = await parseJson<AiJudgmentDto>(res, '판결 결과 조회 실패')
  if (!json.success || !json.data) throw new Error(json.error?.message ?? '판결 결과 조회 실패')
  return json.data
}
