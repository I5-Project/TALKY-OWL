'use client';

import Snackbar from '@mui/material/Snackbar';
import { useToastStore } from '@/stores/toastStore';
import styles from './Toast.module.scss';

export default function Toast() {
  const { message, isVisible, hide } = useToastStore();

  return (
    <Snackbar
      open={isVisible}
      autoHideDuration={3000}
      onClose={hide}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <div className={styles.toast} role="status" aria-live="polite">
        {message}
      </div>
    </Snackbar>
  );
}
