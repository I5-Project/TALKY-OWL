import MuiAvatar from '@mui/material/Avatar';
import MuiAvatarGroup from '@mui/material/AvatarGroup';
import styles from './Avatar.module.scss';

type AvatarSize = 's' | 'm' | 'l';

const SIZE_MAP: Record<AvatarSize, { width: number; height: number; fontSize: number }> = {
  s: { width: 24, height: 24, fontSize: 10 },
  m: { width: 48, height: 48, fontSize: 14 },
  l: { width: 64, height: 64, fontSize: 18 },
};

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

export default function Avatar({ src, alt, size = 's', className }: AvatarProps) {
  const { width, height, fontSize } = SIZE_MAP[size];

  return (
    <MuiAvatar
      src={src}
      alt={alt}
      className={`${styles.avatar} ${className ?? ''}`}
      sx={{
        width,
        height,
        fontSize,
        bgcolor: 'var(--icon-secondary)',
        color: 'var(--color-white)',
      }}
    />
  );
}

export function AvatarGroup({ children, max = 2, size = 's', className }: AvatarGroupProps) {
  const { width, height, fontSize } = SIZE_MAP[size];

  return (
    <MuiAvatarGroup
      max={max}
      className={`${styles.avatarGroup} ${className ?? ''}`}
      spacing="small"
      sx={{
        '& .MuiAvatar-root': {
          width,
          height,
          fontSize,
          bgcolor: 'var(--icon-secondary)',
          color: 'var(--color-white)',
          borderColor: 'var(--bg-surface)',
        },
      }}
    >
      {children}
    </MuiAvatarGroup>
  );
}
