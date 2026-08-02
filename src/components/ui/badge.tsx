'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

const variants = {
  default:
    'bg-surface-2 text-foreground-muted border border-border',
  success:
    'bg-success/10 text-success border border-success/20',
  warning:
    'bg-warning/10 text-warning border border-warning/20',
  danger:
    'bg-destructive/10 text-destructive border border-destructive/20',
  info:
    'bg-primary/10 text-primary border border-primary/20',
} as const;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium tracking-[0.01em]',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

Badge.displayName = 'Badge';

export { Badge };
