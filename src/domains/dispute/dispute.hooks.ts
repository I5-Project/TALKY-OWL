'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { CategoryGroup } from '@/types/common';
import type { DisputeDto, DisputeStatus } from '@/types/dispute';
import {
  fetchCompletedCases,
  fetchDisputesByDate,
  fetchDispute,
  saveStatement,
  submitStatement,
  requestJudgment,
  closeDispute,
} from './dispute.api';

export const disputeKeys = {
  detail: (id: string) => ['dispute', id] as const,
  completedList: (categoryGroup?: CategoryGroup) =>
    ['disputes', 'completed', categoryGroup ?? 'all'] as const,
  byDate: (date: string, status?: DisputeStatus) => ['disputes', 'byDate', date, status] as const,
};

export function useCompletedCases(categoryGroup?: CategoryGroup) {
  return useQuery({
    queryKey: disputeKeys.completedList(categoryGroup),
    queryFn: () => fetchCompletedCases(categoryGroup),
    staleTime: 1000 * 60,
  });
}

export function useDisputesByDate(date: string, status?: DisputeStatus) {
  return useQuery({
    queryKey: disputeKeys.byDate(date, status),
    queryFn: () => fetchDisputesByDate(date, status),
    enabled: !!date,
  });
}

export function useDispute(
  disputeId: string,
  options?: Pick<UseQueryOptions<DisputeDto>, 'refetchInterval'>,
) {
  return useQuery({
    queryKey: disputeKeys.detail(disputeId),
    queryFn: () => fetchDispute(disputeId),
    enabled: !!disputeId,
    refetchInterval: options?.refetchInterval,
  });
}

export function useSaveStatement(disputeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => saveStatement(disputeId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(disputeId) });
    },
  });
}

export function useSubmitStatement(disputeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => submitStatement(disputeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(disputeId) });
    },
  });
}

export function useRequestJudgment(disputeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => requestJudgment(disputeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(disputeId) });
    },
  });
}

export function useCloseDispute(disputeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => closeDispute(disputeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(disputeId) });
    },
  });
}
