import FavoriteIcon from '@mui/icons-material/Favorite';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';

export type CategoryWithoutAll = '연애' | '직장' | '친구' | '가족';

export const CATEGORY_ICON_MAP: Record<CategoryWithoutAll, React.ElementType> = {
  연애: FavoriteIcon,
  직장: BusinessCenterIcon,
  친구: Diversity3Icon,
  가족: FamilyRestroomIcon,
};

const CATEGORY_COLOR_MAP: Record<CategoryWithoutAll, string> = {
  연애: 'var(--category-love-text)',
  직장: 'var(--category-work-text)',
  친구: 'var(--category-friend-text)',
  가족: 'var(--category-family-text)',
};

interface CategoryIconProps {
  category: CategoryWithoutAll;
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
