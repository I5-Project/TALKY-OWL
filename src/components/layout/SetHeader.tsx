'use client'

import { useEffect } from 'react'
import { useHeaderStore } from '@/stores/headerStore'

type Props =
  | { variant: 'logo'; transparent?: boolean }
  | { variant?: 'title'; title: string; subtitle?: string; transparent?: boolean }

export default function SetHeader(props: Props) {
  const setHeader = useHeaderStore((s) => s.setHeader)

  useEffect(() => {
    if (props.variant === 'logo') {
      setHeader({ variant: 'logo', transparent: props.transparent })
    } else {
      setHeader({ variant: 'title', title: props.title, transparent: props.transparent, subtitle: props.subtitle })
    }
    return () => setHeader(null)
  }, [])

  return null
}
