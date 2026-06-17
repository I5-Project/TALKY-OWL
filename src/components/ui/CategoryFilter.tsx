'use client';

import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import type { CategoryGroup } from '@/types/common';
import { CATEGORY_ICON_MAP, CATEGORY_LABEL_MAP } from './CategoryIcon';
import styles from './CategoryFilter.module.scss';

export type Category = 'all' | CategoryGroup;

interface CategoryFilterProps {
  value: Category;
  onChange: (category: Category) => void;
  mode?: 'filter' | 'single';
}

const CATEGORIES: { key: Category; Icon: React.ElementType; label: string }[] = [
  { key: 'all',     Icon: GridViewRoundedIcon,        label: '전체' },
  { key: 'romance', Icon: CATEGORY_ICON_MAP.romance,  label: CATEGORY_LABEL_MAP.romance },
  { key: 'work',    Icon: CATEGORY_ICON_MAP.work,     label: CATEGORY_LABEL_MAP.work },
  { key: 'friend',  Icon: CATEGORY_ICON_MAP.friend,   label: CATEGORY_LABEL_MAP.friend },
  { key: 'family',  Icon: CATEGORY_ICON_MAP.family,   label: CATEGORY_LABEL_MAP.family },
];

export default function CategoryFilter({ value, onChange, mode = 'filter' }: CategoryFilterProps) {
  const visibleCategories = mode === 'single'
    ? CATEGORIES.filter(({ key }) => key === value)
    : CATEGORIES;

  return (
    <div className={styles.container}>
      {visibleCategories.map(({ key, Icon, label }) => {
        const isSelected = value === key;
        return (
          <button
            key={key}
            type="button"
            className={styles.item}
            onClick={() => onChange(key)}
          >
            <div className={`${styles.iconBox} ${isSelected ? styles['iconBox--selected'] : ''}`}>
              <Icon />
            </div>
            <span className={`${styles.label} ${isSelected ? styles['label--selected'] : ''}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
