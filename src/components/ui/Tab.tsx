import styles from './Tab.module.scss';

export interface TabItem {
  label: string;
  value: string;
}

interface TabProps {
  items: TabItem[];
  activeValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function Tab({ items, activeValue, onChange, className }: TabProps) {
  return (
    <div className={[styles.tabList, className].filter(Boolean).join(' ')}>
      {items.map((item) => {
        const isActive = item.value === activeValue;
        return (
          <button
            key={item.value}
            className={`${styles.tabItem} ${isActive ? styles['tabItem--active'] : styles['tabItem--inactive']}`}
            onClick={() => onChange(item.value)}
            type="button"
          >
            <span className={styles.label}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
