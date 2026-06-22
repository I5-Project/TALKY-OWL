import React from 'react';
import styles from './Textarea.module.scss';

function getByteLength(str: string): number {
  let bytes = 0
  for (const char of str) {
    bytes += char.charCodeAt(0) > 0x7f ? 2 : 1
  }
  return bytes
}

function truncateToByteLength(str: string, maxBytes: number): string {
  let bytes = 0
  let result = ''
  for (const char of str) {
    const charBytes = char.charCodeAt(0) > 0x7f ? 2 : 1
    if (bytes + charBytes > maxBytes) break
    bytes += charBytes
    result += char
  }
  return result
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  maxLength?: number;
  isFiltered?: boolean;
  filterMessage?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, maxLength, isFiltered = false, filterMessage, error, value, className, id, onChange, ...props }, ref) => {
    const currentBytes = typeof value === 'string' ? getByteLength(value) : 0;
    const textareaId = id ?? (label ? `textarea-${label}` : undefined);
    const hasError = Boolean(error);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (maxLength !== undefined && getByteLength(e.target.value) > maxLength) {
        e.target.value = truncateToByteLength(e.target.value, maxLength)
      }
      onChange?.(e)
    }

    return (
      <div className={styles.field}>
        {label && (
          <label className={styles.field__label} htmlFor={textareaId}>
            {label}
          </label>
        )}
        <div className={styles.field__wrapper}>
          <textarea
            ref={ref}
            id={textareaId}
            value={value}
            className={[
              styles.field__textarea,
              hasError ? styles['field__textarea--error'] : '',
              className ?? '',
            ].join(' ')}
            onChange={handleChange}
            {...props}
          />
          {maxLength !== undefined && (
            <span className={styles.field__counter}>
              {currentBytes}/{maxLength}
            </span>
          )}
        </div>
        {(filterMessage || isFiltered || error) && (
          <div className={styles.field__footer}>
            {(filterMessage || isFiltered) && (
              <span className={styles['field__filter-warning']}>
                {filterMessage ?? '욕설이 감지되어 가리기처리 됩니다'}
              </span>
            )}
            {error && <span className={styles.field__error}>{error}</span>}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
