'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUserMe, updateUserProfile, uploadProfileImage } from './api'
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

export function useUploadProfileImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => uploadProfileImage(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_ME_KEY })
    },
  })
}
