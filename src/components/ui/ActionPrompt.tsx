'use client';

import Button from './Button';
import styles from './ActionPrompt.module.scss';

interface ActionPromptProps {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
  secondaryVariant?: 'outline' | 'soft';
  size?: 'md' | 'sm';
}

export default function ActionPrompt({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  secondaryVariant = 'outline',
  size = 'md',
}: ActionPromptProps) {
  return (
    <div className={styles.prompt}>
      <div className={styles.prompt__actions}>
        <Button variant={secondaryVariant} size={size} onClick={onSecondary}>
          {secondaryLabel}
        </Button>
        <Button variant="primary" size={size} onClick={onPrimary}>
          {primaryLabel}
        </Button>
      </div>
    </div>
  );
}
