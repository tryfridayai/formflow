'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[11px] font-medium text-gray-600',
        'dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400',
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}

Kbd.displayName = 'Kbd';

export { Kbd };
