import FavoriteIcon from '@mui/icons-material/Favorite';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import type { CategoryGroup } from '@/types/common';

export const CATEGORY_ICON_MAP: Record<CategoryGroup, React.ElementType> = {
  romance: FavoriteIcon,
  work:    BusinessCenterIcon,
  friend:  Diversity3Icon,
  family:  FamilyRestroomIcon,
};

export const CATEGORY_LABEL_MAP: Record<CategoryGroup, string> = {
  romance: '연애',
  work:    '직장',
  friend:  '친구',
  family:  '가족',
};

const CATEGORY_COLOR_MAP: Record<CategoryGroup, string> = {
  romance: 'var(--category-love-text)',
  work:    'var(--category-work-text)',
  friend:  'var(--category-friend-text)',
  family:  'var(--category-family-text)',
};

interface CategoryIconProps {
  category: CategoryGroup;
}

export default function CategoryIcon({ category }: CategoryIconProps) {
  const Icon = CATEGORY_ICON_MAP[category];
  return (
    <Icon
      style={{
        width: 24,
        height: 24,
        color: CATEGORY_COLOR_MAP[category],
        display: 'block',
      }}
    />
  );
}
