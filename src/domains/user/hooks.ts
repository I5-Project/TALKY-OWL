'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUserMe, updateUserProfile } from './api'
import type { UpdateProfileParams } from './api'

export const USER_ME_KEY = ['user', 'me'] as const

export function useUserMe() {
  return useQuery({
    queryKey: USER_ME_KEY,
    queryFn: fetchUserMe,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: UpdateProfileParams) => updateUserProfile(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_ME_KEY })
    },
  })
}
