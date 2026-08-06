import { cn } from '@/lib/cn'

interface LeadUserLabelProps {
  userId: string | null | undefined
  label?: string | null
  className?: string
}

export function LeadUserLabel({ userId, label, className }: LeadUserLabelProps) {
  if (!userId) {
    return <span className={cn('text-slate-400', className)}>{label ?? '--'}</span>
  }

  return <span className={cn('text-slate-900', className)}>{label ?? userId}</span>
}
