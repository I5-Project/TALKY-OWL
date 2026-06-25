// ============================================================
// Tabs
// ============================================================

/** Tabs 컴포넌트 단일 탭 아이템 */
export interface Tab {
  id: string
  label: string
}

/** Tabs 컴포넌트 Props */
export interface TabsProps {
  tabs: Tab[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}
