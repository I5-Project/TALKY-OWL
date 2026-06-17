'use client';

import Button from './Button';
import styles from './ActionPrompt.module.scss';

interface ActionPromptProps {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
}

export default function ActionPrompt({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: ActionPromptProps) {
  return (
    <div className={styles.prompt}>
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
