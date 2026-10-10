import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  searchable?: boolean
  placeholder?: string
  emptyLabel?: string
  disabled?: boolean
  'aria-label'?: string
  id?: string
  className?: string
}

export function MultiSelect({
  options,
  value,
  onChange,
  searchable = false,
  placeholder = 'Any',
  emptyLabel = 'No matches',
  disabled = false,
  id,
  className,
  'aria-label': ariaLabel,
}: MultiSelectProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selectedSet = useMemo(() => new Set(value), [value])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  const summary =
    value.length === 0
      ? placeholder
      : value.length <= 2
        ? value.join(', ')
        : `${value.length} selected`

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    function onDocMouseDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  function toggle(optionValue: string) {
    if (selectedSet.has(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  function clearAll() {
    onChange([])
  }

  return (
    <div ref={rootRef} className={cn('relative min-w-0', className)}>
      <button
        id={id}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((prev) => !prev)
        }}
        className={cn(
          'flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 text-left text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2',
          disabled && 'cursor-not-allowed bg-slate-50 text-slate-400',
          value.length === 0 && 'text-slate-500',
        )}
      >
        <span className="min-w-0 flex-1 truncate">{summary}</span>
        <span className="shrink-0 text-slate-400" aria-hidden>
          ▾
        </span>
      </button>
      {open && !disabled ? (
        <div
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
        >
          {searchable ? (
            <div className="border-b border-slate-100 p-2">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter…"
                aria-label={`${ariaLabel ?? 'Options'} search`}
                className="h-8 w-full rounded-md border border-slate-200 px-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                autoFocus
              />
            </div>
          ) : null}
          <div className="flex items-center justify-between border-b border-slate-100 px-2 py-1.5">
            <span className="text-xs text-slate-500">
              {value.length === 0 ? 'None selected' : `${value.length} selected`}
            </span>
            {value.length > 0 ? (
              <button
                type="button"
                className="text-xs font-medium text-slate-700 underline"
                onMouseDown={(event) => event.preventDefault()}
                onClick={clearAll}
              >
                Clear
              </button>
            ) : null}
          </div>
          <ul className="max-h-56 overflow-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-400">{emptyLabel}</li>
            ) : (
              filtered.map((option) => {
                const checked = selectedSet.has(option.value)
                return (
                  <li key={option.value}>
                    <label
                      className={cn(
                        'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50',
                        checked && 'bg-slate-100 font-medium text-slate-900',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(option.value)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    </label>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
