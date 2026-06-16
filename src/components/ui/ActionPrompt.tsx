'use client';

import Button from './Button';
import styles from './ActionPrompt.module.scss';

interface ActionPromptProps {
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
}

export default function ActionPrompt({
  message,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: ActionPromptProps) {
  return (
    <div className={styles.prompt}>
      <p className={styles.prompt__message}>{message}</p>
      <div className={styles.prompt__actions}>
        <Button variant="outline" onClick={onSecondary}>
          {secondaryLabel}
        </Button>
        <Button variant="primary" onClick={onPrimary}>
          {primaryLabel}
        </Button>
      </div>
    </div>
  );
}
