import type { ApiResponse } from '@/types/common'
import type {
  DisputeDto,
  DisputeStatementDto,
  StatementSubmitResponse,
} from '@/types/dispute'

export async function fetchDispute(disputeId: string): Promise<DisputeDto> {
  const res = await fetch(`/api/disputes/${disputeId}`)
  const json: ApiResponse<DisputeDto> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message ?? '사건 조회 실패')
  return json.data
}

export async function saveStatement(disputeId: string, content: string): Promise<DisputeStatementDto> {
  const res = await fetch(`/api/disputes/${disputeId}/statements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
  const json: ApiResponse<DisputeStatementDto> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message ?? '진술 저장 실패')
  return json.data
}

export async function submitStatement(disputeId: string): Promise<StatementSubmitResponse> {
  const res = await fetch(`/api/disputes/${disputeId}/statements/submit`, {
    method: 'POST',
  })
  const json: ApiResponse<StatementSubmitResponse> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message ?? '진술 제출 실패')
  return json.data
}

export async function requestJudgment(disputeId: string): Promise<void> {
  const res = await fetch(`/api/disputes/${disputeId}/judge`, { method: 'POST' })
  const json: ApiResponse = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? 'AI 판결 요청 실패')
}
