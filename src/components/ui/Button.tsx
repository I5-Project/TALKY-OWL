import styles from './Button.module.scss';

type ButtonVariant = 'primary' | 'outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  disabled = false,
  children,
  className,
  ...props
}: ButtonProps) {
  const variantClass = disabled
    ? styles['button--disabled']
    : styles[`button--${variant}`];

  return (
    <button
      className={`${styles.button} ${variantClass} ${className ?? ''}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
