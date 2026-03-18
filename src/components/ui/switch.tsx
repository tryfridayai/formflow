'use client';

import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

function Switch({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  className,
  id: propId,
}: SwitchProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <button
        id={id}
        role="switch"
        type="button"
        aria-checked={checked}
        aria-label={label && !label ? undefined : label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:ring-offset-1',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked
            ? 'bg-indigo-600'
            : 'bg-gray-200 dark:bg-gray-700'
        )}
      >
        <motion.span
          className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm"
          animate={{ x: checked ? 16 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          aria-hidden="true"
        />
      </button>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'cursor-pointer text-sm text-gray-700 dark:text-gray-300',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
}

Switch.displayName = 'Switch';

export { Switch };
