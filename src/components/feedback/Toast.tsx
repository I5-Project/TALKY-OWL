'use client';

import { useToastStore } from '@/stores/toastStore';
import styles from './Toast.module.scss';

export default function Toast() {
  const { message, isVisible } = useToastStore();

  return (
    <div
      className={`${styles.toast} ${!isVisible ? styles['toast--hidden'] : ''}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
