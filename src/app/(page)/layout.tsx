'use client'

import { usePathname } from 'next/navigation'
import BottomNavigation from '@/components/layout/BottomNavigation'

export default function PageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideNav =
    pathname.endsWith('/statement') ||
    pathname.startsWith('/join/') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy')

  return (
    <>
      {children}
      {!hideNav && <BottomNavigation />}
    </>
  )
}
