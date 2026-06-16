import React from 'react';
import styles from './Textarea.module.scss';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  maxLength?: number;
  isFiltered?: boolean;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, maxLength, isFiltered = false, error, value, className, id, ...props }, ref) => {
    const currentLength = typeof value === 'string' ? value.length : 0;
    const textareaId = id ?? (label ? `textarea-${label}` : undefined);
    const hasError = Boolean(error || isFiltered);

    return (
      <div className={styles.field}>
        {label && (
          <label className={styles.field__label} htmlFor={textareaId}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          maxLength={maxLength}
          className={[
            styles.field__textarea,
            hasError ? styles['field__textarea--error'] : '',
            className ?? '',
          ].join(' ')}
          {...props}
        />
        <div className={styles.field__footer}>
          <div>
            {isFiltered && (
              <span className={styles['field__filter-warning']}>
                욕설이 감지되어 가리기처리 됩니다
              </span>
            )}
            {error && <span className={styles.field__error}>{error}</span>}
          </div>
          {maxLength !== undefined && (
            <span className={styles.field__counter}>
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
