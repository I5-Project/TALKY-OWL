import Image from 'next/image';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './Spinner.module.scss';

interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className }: SpinnerProps) {
  return (
    <div className={`${styles.spinner} ${className ?? ''}`}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={88}
        thickness={1.5}
        className={styles.progress}
        sx={{ color: 'var(--border-default)' }}
      />
      <CircularProgress
        size={88}
        thickness={1.5}
        className={styles.progress}
        sx={{ color: 'var(--bg-brand)' }}
      />
      <Image
        src="/images/characters/character-loading.svg"
        alt="로딩 중"
        width={56}
        height={56}
        className={styles.image}
      />
    </div>
  );
}
