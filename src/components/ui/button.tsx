import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'destructive'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variants: Record<ButtonVariant, string> = {
  default: 'bg-slate-900 text-white hover:bg-slate-700',
  outline: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-100',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  destructive: 'bg-red-600 text-white hover:bg-red-500',
}

export function Button({ className, variant = 'default', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
