import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
