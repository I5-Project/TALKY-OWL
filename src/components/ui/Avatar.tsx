'use client';

import { createContext, useContext } from 'react';
import MuiAvatar from '@mui/material/Avatar';
import MuiAvatarGroup from '@mui/material/AvatarGroup';
import styles from './Avatar.module.scss';

type AvatarSize = 's' | 'm' | 'l';

const SIZE_MAP: Record<AvatarSize, { width: number; height: number; fontSize: number }> = {
  s: { width: 24, height: 24, fontSize: 10 },
  m: { width: 48, height: 48, fontSize: 14 },
  l: { width: 64, height: 64, fontSize: 18 },
};

const AvatarSizeContext = createContext<AvatarSize | null>(null);

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  className?: string;
}

interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

const FALLBACK_SRC = '/images/common/thumbnail-default.png';

export default function Avatar({ src, alt, size: sizeProp = 's', className }: AvatarProps) {
  const groupSize = useContext(AvatarSizeContext);
  const size = groupSize ?? sizeProp;
  const { width, height, fontSize } = SIZE_MAP[size];

  return (
    <MuiAvatar
      src={src ?? FALLBACK_SRC}
      alt={alt}
      className={`${styles.avatar} ${className ?? ''}`}
      sx={{
        width,
        height,
        fontSize,
        bgcolor: 'var(--icon-secondary)',
        color: 'var(--text-inverse)',
      }}
    />
  );
}

export function AvatarGroup({ children, max = 2, size = 's', className }: AvatarGroupProps) {
  return (
    <AvatarSizeContext.Provider value={size}>
      <MuiAvatarGroup
        max={max}
        className={`${styles.avatarGroup} ${className ?? ''}`}
        spacing="small"
        sx={{
          '& .MuiAvatar-root': {
            borderColor: 'var(--bg-surface)',
          },
        }}
      >
        {children}
      </MuiAvatarGroup>
    </AvatarSizeContext.Provider>
  );
}
