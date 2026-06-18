import styles from './Button.module.scss';

type ButtonVariant = 'primary' | 'outline' | 'soft';
type ButtonSize = 'md' | 'sm';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  className,
  ...props
}: ButtonProps) {
  const variantClass = disabled
    ? styles['button--disabled']
    : styles[`button--${variant}`];
  const sizeClass = size === 'sm' ? styles['button--sm'] : '';

  return (
    <button
      className={`${styles.button} ${variantClass} ${sizeClass} ${className ?? ''}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
