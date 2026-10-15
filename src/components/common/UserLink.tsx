import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { routes } from '@/router/paths'

interface UserLinkProps {
  userId: string | null | undefined
  label?: string | null
  className?: string
}

export function UserLink({ userId, label, className }: UserLinkProps) {
  if (!userId) {
    return <span className={cn('text-slate-400', className)}>{label ?? '--'}</span>
  }

  return (
    <Link className={cn('text-slate-900 underline', className)} to={routes.userDetail(userId)}>
      {label ?? userId}
    </Link>
  )
}
