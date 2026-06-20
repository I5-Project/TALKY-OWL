'use client'

import { usePathname } from 'next/navigation'
import BottomNavigation from '@/components/layout/BottomNavigation'

export default function PageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideNav = pathname.endsWith('/statement')

  return (
    <>
      {children}
      {!hideNav && <BottomNavigation />}
    </>
  )
}
