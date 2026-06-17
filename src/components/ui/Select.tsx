'use client'

import React from 'react'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import styles from './Select.module.scss'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  options: SelectOption[]
  placeholder?: string
  value?: string
  onChange?: (e: { target: { value: string } }) => void
  error?: string
  className?: string
  id?: string
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ label, options, placeholder, value, onChange, error, className, id }, ref) => {
    const [open, setOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const selectId = id ?? (label ? `select-${label}` : undefined)

    React.useEffect(() => {
      const handleOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false)
        }
      }
      if (open) document.addEventListener('mousedown', handleOutside)
      return () => document.removeEventListener('mousedown', handleOutside)
    }, [open])

    const selectedLabel = options.find((o) => o.value === value)?.label
    const hasValue = Boolean(value)

    const handleSelect = (optionValue: string) => {
      onChange?.({ target: { value: optionValue } })
      setOpen(false)
    }

    return (
      <div ref={containerRef} className={styles.field}>
        {label && (
          <label className={styles.field__label} htmlFor={selectId}>
            {label}
          </label>
        )}
        <div
          ref={ref}
          className={styles.field__wrapper}
        >
          <button
            type="button"
            id={selectId}
            className={[
              styles.field__trigger,
              !hasValue ? styles['field__trigger--placeholder'] : '',
              error ? styles['field__trigger--error'] : '',
              className ?? '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-haspopup="listbox"
          >
            {hasValue ? selectedLabel : placeholder}
          </button>
          <KeyboardArrowDownRoundedIcon
            className={[
              styles.field__chevron,
              open ? styles['field__chevron--open'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            sx={{ fontSize: 20 }}
            aria-hidden="true"
          />
          {open && (
            <ul className={styles.field__dropdown} role="listbox">
              {options.map((opt) => (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={opt.value === value}
                  className={[
                    styles.field__option,
                    opt.value === value ? styles['field__option--selected'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onMouseDown={() => handleSelect(opt.value)}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && <span className={styles.field__error}>{error}</span>}
      </div>
    )
  }
)

Select.displayName = 'Select'
export default Select
