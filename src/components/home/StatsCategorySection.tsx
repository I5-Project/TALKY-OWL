'use client';

import FavoriteIcon from '@mui/icons-material/Favorite';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import styles from './StatsCategorySection.module.scss';

interface CategoryStat {
  key: 'romance' | 'work' | 'friend' | 'family';
  label: string;
  percentage: number;
}

const DUMMY_STATS: CategoryStat[] = [
  { key: 'romance', label: '연인관계', percentage: 40 },
  { key: 'work',    label: '직장관계', percentage: 35 },
  { key: 'friend',  label: '친구관계', percentage: 20 },
  { key: 'family',  label: '가족관계', percentage: 5  },
];

const ICON_MAP = {
  romance: FavoriteIcon,
  work:    BusinessCenterIcon,
  friend:  Diversity3Icon,
  family:  FamilyRestroomIcon,
};

export default function StatsCategorySection() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>고민 카테고리 TOP4</h2>

      {/* 단일 스택 바 */}
      <div className={styles.bar}>
        {DUMMY_STATS.map(({ key, percentage }) => (
          <div
            key={key}
            className={`${styles.bar__segment} ${styles[`bar__segment--${key}`]}`}
            style={{ width: `${percentage}%` }}
          />
        ))}
      </div>

      {/* 카테고리 레이블 2×2 그리드 */}
      <div className={styles.labels}>
        {DUMMY_STATS.map(({ key, label, percentage }) => {
          const Icon = ICON_MAP[key];
          return (
            <div key={key} className={styles.label}>
              <Icon className={`${styles.label__icon} ${styles[`label__icon--${key}`]}`} />
              <span className={`${styles.label__text} ${styles[`label__text--${key}`]} ${styles['label__text--bold']}`}>
                {label}
              </span>
              <span className={`${styles.label__percent} ${styles[`label__percent--${key}`]}`}>
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
