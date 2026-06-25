'use client';

import FavoriteIcon from '@mui/icons-material/Favorite';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import { useStatistics } from '@/hooks/useStatistics';
import styles from './StatsCategorySection.module.scss';

type CategoryKey = 'ROMANCE' | 'WORK' | 'FRIEND' | 'FAMILY';

const CATEGORY_CONFIG: Record<
  CategoryKey,
  { label: string; icon: React.ElementType; styleKey: string }
> = {
  ROMANCE: { label: '연인관계', icon: FavoriteIcon, styleKey: 'romance' },
  WORK: { label: '직장관계', icon: BusinessCenterIcon, styleKey: 'work' },
  FRIEND: { label: '친구관계', icon: Diversity3Icon, styleKey: 'friend' },
  FAMILY: { label: '가족관계', icon: FamilyRestroomIcon, styleKey: 'family' },
};

const PLACEHOLDER_CATEGORIES = ['ROMANCE', 'WORK', 'FRIEND', 'FAMILY'] as const;

export default function StatsCategorySection() {
  const { data, isLoading, isError } = useStatistics();

  const isEmpty = !data || data.total === 0;
  const showPlaceholder = isLoading || isError || isEmpty;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>고민 카테고리 TOP4</h2>

      {/* 단일 스택 바: 데이터 없거나 로딩/에러면 25%씩 회색 플레이스홀더 */}
      <div className={styles.bar}>
        {showPlaceholder
          ? PLACEHOLDER_CATEGORIES.map((category) => (
              <div
                key={category}
                className={`${styles.bar__segment} ${styles['bar__segment--placeholder']}`}
              />
            ))
          : data!.items.map(({ category, percentage }) => {
              const { styleKey } = CATEGORY_CONFIG[category as CategoryKey];
              return (
                <div
                  key={category}
                  className={`${styles.bar__segment} ${styles[`bar__segment--${styleKey}`]}`}
                  style={{ width: `${percentage}%` }}
                />
              );
            })}
      </div>

      {/* 카테고리 레이블 2×2 그리드: 아이콘 + 이름(볼드) + 퍼센트 */}
      <div className={styles.labels}>
        {PLACEHOLDER_CATEGORIES.map((category) => {
          const { label, icon: Icon, styleKey } = CATEGORY_CONFIG[category];
          const percentage = showPlaceholder
            ? null
            : (data!.items.find((i) => i.category === category)?.percentage ?? 0);
          return (
            <div key={category} className={styles.label}>
              <Icon
                className={`${styles.label__icon} ${styles[`label__icon--${styleKey}`]}`}
                sx={{ fontSize: 18 }}
              />
              <span className={`${styles.labelText} ${styles[`labelText--${styleKey}`]}`}>
                {label}
              </span>
              <span className={`${styles.label__percent} ${styles[`label__percent--${styleKey}`]}`}>
                {percentage === null ? '-' : `${percentage}%`}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
