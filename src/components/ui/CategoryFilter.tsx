'use client';

import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import { CATEGORY_ICON_MAP, type CategoryWithoutAll } from './CategoryIcon';
import styles from './CategoryFilter.module.scss';

export type Category = '전체' | CategoryWithoutAll;

interface CategoryFilterProps {
  value: Category;
  onChange: (category: Category) => void;
  mode?: 'filter' | 'single';
}

const CATEGORIES: { key: Category; Icon: React.ElementType }[] = [
  { key: '전체', Icon: GridViewRoundedIcon },
  ...(['연애', '직장', '친구', '가족'] as CategoryWithoutAll[]).map((key) => ({
    key,
    Icon: CATEGORY_ICON_MAP[key],
  })),
];

export default function CategoryFilter({ value, onChange, mode = 'filter' }: CategoryFilterProps) {
  const visibleCategories = mode === 'single'
    ? CATEGORIES.filter(({ key }) => key === value)
    : CATEGORIES;

  return (
    <div className={styles.container}>
      {visibleCategories.map(({ key, Icon }) => {
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
              {key}
            </span>
          </button>
        );
      })}
    </div>
  );
}
