'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import BottomNavigation from '@/components/layout/BottomNavigation'
import { useHeaderStore } from '@/stores/headerStore'

export default function PageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const header = useHeaderStore((s) => s.header)

  const hideNav =
    pathname.endsWith('/statement') ||
    pathname.startsWith('/join/') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy')

  return (
    <>
      {header && (
        header.variant === 'logo'
          ? <Header variant="logo" transparent={header.transparent} />
          : <Header variant="title" title={header.title} subtitle={header.subtitle} onBack={header.onBack} transparent={header.transparent} />
      )}
      <main>{children}</main>
      {!hideNav && <BottomNavigation />}
    </>
  )
}
