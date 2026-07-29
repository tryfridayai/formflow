'use client';

import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id: propId, type = 'text', ...props }, ref) => {
    const generatedId = useId();
    const id = propId ?? generatedId;
    const errorId = `${id}-error`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-medium text-foreground-muted"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            type={type}
            className={cn(
              'input flex h-9 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground',
              'placeholder:text-foreground-subtle',
              'disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-10',
              error &&
                'border-destructive focus:border-destructive focus:ring-destructive/20',
              className
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
