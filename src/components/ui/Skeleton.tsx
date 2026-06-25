import styles from './Skeleton.module.scss';

interface Props {
  className?: string;
}

export default function Skeleton({ className }: Props) {
  return <div className={`${styles.skeleton}${className ? ` ${className}` : ''}`} />;
}
