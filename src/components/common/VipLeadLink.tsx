import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { routes } from '@/router/paths'

interface VipLeadLinkProps {
  userId: string | null | undefined
  label?: string | null
  className?: string
}

export function VipLeadLink({ userId, label, className }: VipLeadLinkProps) {
  if (!userId) {
    return <span className={cn('text-slate-400', className)}>{label ?? '--'}</span>
  }

  return (
    <Link className={cn('text-slate-900 underline', className)} to={routes.vipLeadDetail(userId)}>
      {label ?? userId}
    </Link>
  )
}
