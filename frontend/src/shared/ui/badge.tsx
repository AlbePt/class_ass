import * as React from 'react'
import { cn } from '../lib/cn'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'outline'

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  outline: 'border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200'
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return <div className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', variantStyles[variant], className)} {...props} />
}
