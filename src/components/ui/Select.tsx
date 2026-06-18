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
    const [focusedIndex, setFocusedIndex] = React.useState(0)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const listboxRef = React.useRef<HTMLUListElement>(null)
    const triggerRef = React.useRef<HTMLButtonElement>(null)

    const internalId = React.useId()
    const resolvedId = id ?? (label ? `select-${label}` : internalId)
    const errorId = `${resolvedId}-error`

    React.useEffect(() => {
      const handleOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false)
        }
      }
      if (open) document.addEventListener('mousedown', handleOutside)
      return () => document.removeEventListener('mousedown', handleOutside)
    }, [open])

    // 드롭다운 열릴 때 listbox 포커스
    React.useEffect(() => {
      if (open) listboxRef.current?.focus()
    }, [open])

    const selectedLabel = options.find((o) => o.value === value)?.label
    const hasValue = selectedLabel !== undefined

    const handleSelect = (optionValue: string) => {
      onChange?.({ target: { value: optionValue } })
      setOpen(false)
      triggerRef.current?.focus()
    }

    const handleToggle = () => {
      if (!open) {
        const selectedIdx = options.findIndex((o) => o.value === value)
        setFocusedIndex(selectedIdx >= 0 ? selectedIdx : 0)
      }
      setOpen((prev) => !prev)
    }

    const handleListKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex((i) => Math.min(i + 1, options.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex((i) => Math.max(i - 1, 0))
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          handleSelect(options[focusedIndex].value)
          break
        case 'Escape':
        case 'Tab':
          e.preventDefault()
          setOpen(false)
          triggerRef.current?.focus()
          break
      }
    }

    const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !open) {
        e.preventDefault()
        const selectedIdx = options.findIndex((o) => o.value === value)
        setFocusedIndex(selectedIdx >= 0 ? selectedIdx : 0)
        setOpen(true)
      }
    }

    return (
      <div ref={containerRef} className={styles.field}>
        {label && (
          <label className={styles.field__label} htmlFor={resolvedId}>
            {label}
          </label>
        )}
        <div ref={ref} className={styles.field__wrapper}>
          <button
            ref={triggerRef}
            type="button"
            id={resolvedId}
            className={[
              styles.field__trigger,
              !hasValue ? styles['field__trigger--placeholder'] : '',
              error ? styles['field__trigger--error'] : '',
              className ?? '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={handleToggle}
            onKeyDown={handleTriggerKeyDown}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
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
            <ul
              ref={listboxRef}
              className={styles.field__dropdown}
              role="listbox"
              tabIndex={-1}
              aria-activedescendant={`${resolvedId}-option-${options[focusedIndex]?.value}`}
              onKeyDown={handleListKeyDown}
            >
              {options.map((opt, idx) => (
                <li
                  key={opt.value}
                  id={`${resolvedId}-option-${opt.value}`}
                  role="option"
                  aria-selected={opt.value === value}
                  className={[
                    styles.field__option,
                    opt.value === value ? styles['field__option--selected'] : '',
                    idx === focusedIndex ? styles['field__option--focused'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onMouseDown={() => handleSelect(opt.value)}
                  onMouseEnter={() => setFocusedIndex(idx)}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && (
          <span id={errorId} className={styles.field__error}>
            {error}
          </span>
        )}
      </div>
    )
  },
)

Select.displayName = 'Select'
export default Select
