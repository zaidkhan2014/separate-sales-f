import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

export interface SearchableSelectOption {
  value: string
  label: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyLabel?: string
  disabled?: boolean
  'aria-label'?: string
  id?: string
  className?: string
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Search…',
  emptyLabel = 'Any',
  disabled = false,
  id,
  className,
  'aria-label': ariaLabel,
}: SearchableSelectProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selected = options.find((o) => o.value === value)
  const display = open ? query : (selected?.label ?? '')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open, value])

  useEffect(() => {
    function onDocMouseDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  function pick(next: string) {
    onChange(next)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={rootRef} className={cn('relative min-w-0', className)}>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label={ariaLabel}
        disabled={disabled}
        placeholder={placeholder}
        value={display}
        onChange={(event) => {
          setQuery(event.target.value)
          if (!open) setOpen(true)
        }}
        onFocus={() => {
          if (!disabled) setOpen(true)
        }}
        className={cn(
          'h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2',
          disabled && 'cursor-not-allowed bg-slate-50 text-slate-400',
        )}
      />
      {open && !disabled ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={value === ''}
              className={cn(
                'flex w-full px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50',
                value === '' && 'bg-slate-100 font-medium text-slate-900',
              )}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick('')}
            >
              {emptyLabel}
            </button>
          </li>
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-400">No matches</li>
          ) : (
            filtered.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                  className={cn(
                    'flex w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50',
                    value === option.value && 'bg-slate-100 font-medium text-slate-900',
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => pick(option.value)}
                >
                  {option.label}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  )
}
