'use client';

import type { TabsProps } from '@/types/ui';
import styles from '@/components/ui/Tabs.module.scss';

export default function Tabs({ tabs, activeId, onChange }: TabsProps) {
  return (
    <div className={styles.tabs} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeId === tab.id}
          className={`${styles.tabs__tab} ${
            activeId === tab.id ? styles['tabs__tab--active'] : ''
          }`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
