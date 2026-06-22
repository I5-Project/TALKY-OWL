'use client';

import Image from 'next/image';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import type { CategoryGroup } from '@/types/common';
import type { EmotionType } from '@/types/diary';
import { CATEGORY_ICON_MAP, CATEGORY_LABEL_MAP } from './CategoryIcon';
import styles from './CategoryFilter.module.scss';

export type Category = 'all' | CategoryGroup;

type CategoryFilterProps =
  | {
      mode?: 'filter';
      value: Category;
      onChange: (category: Category) => void;
    }
  | {
      mode: 'single';
      value: CategoryGroup;
      onChange: (category: CategoryGroup) => void;
    }
  | {
      mode: 'emotion';
      value: EmotionType;
      onChange: (emotion: EmotionType) => void;
    };

const CATEGORIES: { key: Category; Icon: React.ElementType; label: string }[] = [
  { key: 'all',     Icon: GridViewRoundedIcon,        label: '전체' },
  { key: 'romance', Icon: CATEGORY_ICON_MAP.romance,  label: CATEGORY_LABEL_MAP.romance },
  { key: 'work',    Icon: CATEGORY_ICON_MAP.work,     label: CATEGORY_LABEL_MAP.work },
  { key: 'friend',  Icon: CATEGORY_ICON_MAP.friend,   label: CATEGORY_LABEL_MAP.friend },
  { key: 'family',  Icon: CATEGORY_ICON_MAP.family,   label: CATEGORY_LABEL_MAP.family },
];

const EMOTIONS: { key: EmotionType; src: string; label: string }[] = [
  { key: 'happy',   src: '/images/icons/emotionButton/emotion-happy.svg',   label: '기쁨' },
  { key: 'sad',     src: '/images/icons/emotionButton/emotion-sad.svg',     label: '슬픔' },
  { key: 'angry',   src: '/images/icons/emotionButton/emotion-angry.svg',   label: '화남' },
  { key: 'annoyed', src: '/images/icons/emotionButton/emotion-annoyed.svg', label: '짜증' },
  { key: 'neutral', src: '/images/icons/emotionButton/emotion-neutral.svg', label: '보통' },
];

export default function CategoryFilter(props: CategoryFilterProps) {
  const { value, mode = 'filter' } = props;

  const visibleItems =
    mode === 'emotion'
      ? EMOTIONS.map(({ key, src, label }) => ({
          key,
          label,
          renderIcon: () => <Image src={src} alt={label} width={24} height={24} />,
        }))
      : (mode === 'single' ? CATEGORIES.filter(({ key }) => key === value) : CATEGORIES)
          .map(({ key, Icon, label }) => ({
            key,
            label,
            renderIcon: () => <Icon />,
          }));

  return (
    <div className={styles.container}>
      {visibleItems.map(({ key, label, renderIcon }) => {
        const isSelected = value === key;
        return (
          <button
            key={key}
            type="button"
            className={styles.item}
            onClick={() => {
              if (props.mode === 'emotion') props.onChange(key as EmotionType);
              else if (props.mode === 'single') props.onChange(key as CategoryGroup);
              else props.onChange(key as Category);
            }}
          >
            <div className={`${styles.iconBox} ${isSelected ? styles['iconBox--selected'] : ''}`}>
              {renderIcon()}
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
