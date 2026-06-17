'use client';

// GET /api/statistics/categories → useStatistics() 훅 → 이 컴포넌트 순으로 데이터 흐름
// API는 dispute.status = 'JUDGED'(판결 완료) 사건만 집계한다.
// 판결 완료 사건이 없으면 total=0이 되고 percentage가 모두 0이 되어 바가 보이지 않는다.
// 이는 정상 동작이며, 사건 판결이 완료되면 자동으로 표시된다.
import FavoriteIcon from '@mui/icons-material/Favorite';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import { useStatistics } from '@/hooks/useStatistics';
import styles from './StatsCategorySection.module.scss';

type CategoryKey = 'ROMANCE' | 'WORK' | 'FRIEND' | 'FAMILY';

// 카테고리 키 → 표시 레이블, 아이콘, SCSS 수식자(styleKey) 매핑
// API 응답의 category 값(영문 대문자)을 여기서 한 번만 변환한다.
const CATEGORY_CONFIG: Record<CategoryKey, { label: string; icon: React.ElementType; styleKey: string }> = {
  ROMANCE: { label: '연인관계', icon: FavoriteIcon,         styleKey: 'romance' },
  WORK:    { label: '직장관계', icon: BusinessCenterIcon,   styleKey: 'work'    },
  FRIEND:  { label: '친구관계', icon: Diversity3Icon,       styleKey: 'friend'  },
  FAMILY:  { label: '가족관계', icon: FamilyRestroomIcon,   styleKey: 'family'  },
};

export default function StatsCategorySection() {
  // useStatistics: TanStack Query 기반, staleTime=24h (서버 ISR revalidate 주기와 동일)
  const { data, isLoading, isError } = useStatistics();

  // 로딩 중: 타이틀 + 빈 바 스켈레톤 표시
  if (isLoading) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>고민 카테고리 TOP4</h2>
        <div className={styles.bar} />
      </section>
    );
  }

  // 에러이거나 데이터가 없으면 섹션 자체를 렌더링하지 않음
  if (isError || !data) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>고민 카테고리 TOP4</h2>

      {/* 단일 스택 바: 각 세그먼트 width = percentage% */}
      <div className={styles.bar}>
        {data.items.map(({ category, percentage }) => {
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
        {data.items.map(({ category, percentage }) => {
          const { label, icon: Icon, styleKey } = CATEGORY_CONFIG[category as CategoryKey];
          return (
            <div key={category} className={styles.label}>
              <Icon className={`${styles.label__icon} ${styles[`label__icon--${styleKey}`]}`} />
              <span className={`${styles.label__text} ${styles[`label__text--${styleKey}`]} ${styles['label__text--bold']}`}>
                {label}
              </span>
              <span className={`${styles.label__percent} ${styles[`label__percent--${styleKey}`]}`}>
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
