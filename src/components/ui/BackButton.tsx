'use client'

import { useRouter } from 'next/navigation'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'

interface BackButtonProps {
  className?: string
}

export default function BackButton({ className }: BackButtonProps) {
  const router = useRouter()
  return (
    <button
      type="button"
      className={className}
      onClick={() => router.back()}
      aria-label="뒤로 가기"
    >
      <ArrowBackIosNewIcon />
    </button>
  )
}
