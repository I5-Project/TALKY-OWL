import type { ApiResponse, CategoryGroup } from '@/types/common'
import type {
  DisputeDto,
  DisputeListResponse,
  DisputeStatementDto,
  SaveStatementResponse,
  StatementSubmitResponse,
} from '@/types/dispute'

async function parseJson<T>(res: Response, fallbackMessage: string): Promise<ApiResponse<T>> {
  const text = await res.text()
  try {
    return JSON.parse(text) as ApiResponse<T>
  } catch {
    throw new Error(res.ok ? fallbackMessage : `서버 오류 (${res.status})`)
  }
}

export async function fetchCompletedCases(categoryGroup?: CategoryGroup): Promise<DisputeDto[]> {
  const params = new URLSearchParams({ completed: 'true', limit: '50' })
  if (categoryGroup) params.set('categoryGroup', categoryGroup)
  const res = await fetch(`/api/disputes?${params.toString()}`)
  const json = await parseJson<DisputeListResponse>(res, '사건 기록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.')
  if (!json.success || !json.data) throw new Error(json.error?.message ?? '사건 기록을 불러오지 못했어요.')
  return json.data.disputes
}

export async function fetchDispute(disputeId: string): Promise<DisputeDto> {
  const res = await fetch(`/api/disputes/${disputeId}`)
  const json = await parseJson<DisputeDto>(res, '사건 조회 실패')
  if (!json.success || !json.data) throw new Error(json.error?.message ?? '사건 조회 실패')
  return json.data
}

export async function saveStatement(disputeId: string, content: string): Promise<SaveStatementResponse> {
  const res = await fetch(`/api/disputes/${disputeId}/statements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
  const json = await parseJson<SaveStatementResponse>(res, '진술 저장 실패')
  if (!json.success || !json.data) throw new Error(json.error?.message ?? '진술 저장 실패')
  return json.data
}

export async function submitStatement(disputeId: string): Promise<StatementSubmitResponse> {
  const res = await fetch(`/api/disputes/${disputeId}/statements/submit`, {
    method: 'POST',
  })
  const json = await parseJson<StatementSubmitResponse>(res, '진술 제출 실패')
  if (!json.success || !json.data) throw new Error(json.error?.message ?? '진술 제출 실패')
  return json.data
}

export async function requestJudgment(disputeId: string): Promise<void> {
  const res = await fetch(`/api/disputes/${disputeId}/judge`, { method: 'POST' })
  const json = await parseJson(res, 'AI 판결 요청 실패')
  if (!json.success) throw new Error(json.error?.message ?? 'AI 판결 요청 실패')
}

export async function closeDispute(disputeId: string): Promise<void> {
  const res = await fetch(`/api/disputes/${disputeId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'closed' }),
  })
  const json = await parseJson(res, '사건 종료 실패')
  if (!json.success) throw new Error(json.error?.message ?? '사건 종료 실패')
}
