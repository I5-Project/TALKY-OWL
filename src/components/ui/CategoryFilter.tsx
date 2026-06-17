'use client';

import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import styles from './CategoryFilter.module.scss';

export type Category = '전체' | '연애' | '직장' | '친구' | '가족';

interface CategoryFilterProps {
  value: Category;
  onChange: (category: Category) => void;
}

const CATEGORIES: { key: Category; Icon: React.ElementType }[] = [
  { key: '전체', Icon: GridViewRoundedIcon },
  { key: '연애', Icon: FavoriteIcon },
  { key: '직장', Icon: BusinessCenterIcon },
  { key: '친구', Icon: Diversity3Icon },
  { key: '가족', Icon: FamilyRestroomIcon },
];

export default function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className={styles.container}>
      {CATEGORIES.map(({ key, Icon }) => {
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
            <span className={styles.label}>{key}</span>
          </button>
        );
      })}
    </div>
  );
}
