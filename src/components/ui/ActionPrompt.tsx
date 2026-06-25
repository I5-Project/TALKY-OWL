'use client';

import Button from './Button';
import styles from './ActionPrompt.module.scss';
import clsx from 'clsx';

interface ActionPromptProps {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
  secondaryVariant?: 'outline' | 'soft';
  size?: 'md' | 'sm';
  className?: string;
  primaryDisabled?: boolean;
}

export default function ActionPrompt({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  secondaryVariant = 'outline',
  size = 'md',
  className,
  primaryDisabled = false,
}: ActionPromptProps) {
  return (
    <div className={clsx(styles.prompt, className)}>
      <div className={styles.prompt__actions}>
        <Button variant={secondaryVariant} size={size} onClick={onSecondary}>
          {secondaryLabel}
        </Button>
        <Button variant="primary" size={size} onClick={onPrimary} disabled={primaryDisabled}>
          {primaryLabel}
        </Button>
      </div>
    </div>
  );
}
