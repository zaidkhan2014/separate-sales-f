import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Alert({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg border px-3 py-2 text-sm', className)} role="alert" {...props} />
}
