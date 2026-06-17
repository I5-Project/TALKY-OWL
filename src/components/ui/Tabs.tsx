'use client';

import styles from './Tabs.module.scss';

export type TabItem<T extends string = string> = {
  key: T;
  label: string;
};

type TabsProps<T extends string> = {
  tabs: TabItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  className?: string;
};

export default function Tabs<T extends string>({ tabs, activeKey, onChange, className }: TabsProps<T>) {
  return (
    <div className={[styles.tabs, className].filter(Boolean).join(' ')}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`${styles.tabs__tab} ${activeKey === tab.key ? styles['tabs__tab--active'] : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
