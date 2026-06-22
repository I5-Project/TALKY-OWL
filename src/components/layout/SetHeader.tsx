'use client'

import { useEffect } from 'react'
import { useHeaderStore } from '@/stores/headerStore'

type Props =
  | { variant: 'logo'; transparent?: boolean }
  | { variant?: 'title'; title: string; subtitle?: string; onBack?: () => void; transparent?: boolean }

export default function SetHeader(props: Props) {
  const setHeader = useHeaderStore((s) => s.setHeader)

  useEffect(() => {
    if (props.variant === 'logo') {
      setHeader({ variant: 'logo', transparent: props.transparent })
    } else {
      setHeader({ variant: 'title', title: props.title, subtitle: props.subtitle, onBack: props.onBack, transparent: props.transparent })
    }
    return () => setHeader(null)
  }, [])

  return null
}
