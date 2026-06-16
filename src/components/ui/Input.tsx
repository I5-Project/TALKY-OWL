import React from 'react';
import styles from './Input.module.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? (label ? `input-${label}` : undefined);

    return (
      <div className={styles.field}>
        {label && (
          <label className={styles.field__label} htmlFor={inputId}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            styles.field__input,
            error ? styles['field__input--error'] : '',
            className ?? '',
          ].join(' ')}
          {...props}
        />
        {error && <span className={styles.field__error}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
