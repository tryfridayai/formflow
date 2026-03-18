'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

const variants = {
  default:
    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  success:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  warning:
    'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  danger:
    'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
  info:
    'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
} as const;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        'transition-colors duration-150',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

Badge.displayName = 'Badge';

export { Badge };
