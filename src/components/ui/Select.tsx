import React from 'react';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import styles from './Select.module.scss';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, error, className, id, ...props }, ref) => {
    const selectId = id ?? (label ? `select-${label}` : undefined);

    return (
      <div className={styles.field}>
        {label && (
          <label className={styles.field__label} htmlFor={selectId}>
            {label}
          </label>
        )}
        <div className={styles.field__wrapper}>
          <select
            ref={ref}
            id={selectId}
            className={[
              styles.field__select,
              error ? styles['field__select--error'] : '',
              className ?? '',
            ].join(' ')}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <KeyboardArrowDownRoundedIcon
            className={styles.field__chevron}
            sx={{ fontSize: 20 }}
            aria-hidden="true"
          />
        </div>
        {error && <span className={styles.field__error}>{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
