'use client'

import { useMutation } from '@tanstack/react-query'
import { fetchGiftItem } from './gift.api'

export function useGiftRecommendation() {
  return useMutation({
    mutationFn: ({
      disputeId,
      gender,
      age,
      mbti,
    }: {
      disputeId: string
      gender: string
      age: string
      mbti: string
    }) => fetchGiftItem(disputeId, { gender, age, mbti }),
  })
}
