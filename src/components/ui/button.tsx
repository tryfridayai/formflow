'use client';

import React, { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const variants = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary/90 shadow-sm',
  secondary:
    'bg-surface-2 text-foreground hover:bg-surface-3 active:bg-surface border border-border',
  ghost:
    'bg-transparent text-foreground-muted hover:bg-surface-2 hover:text-foreground active:bg-surface-3',
  danger:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 shadow-sm',
} as const;

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-9 px-3.5 text-sm gap-2 rounded-lg',
  lg: 'h-10 px-5 text-sm gap-2 rounded-lg',
} as const;

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  disabled?: boolean;
  asChild?: boolean;
  children?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const classes = cn(
      'btn inline-flex items-center justify-center font-medium transition-all',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-1',
      'disabled:pointer-events-none disabled:opacity-60',
      variants[variant],
      sizes[size],
      className
    );

    if (asChild) {
      return (
        <motion.span
          className={classes}
          whileHover={isDisabled ? undefined : { y: -0.5 }}
          whileTap={isDisabled ? undefined : { y: 0 }}
          transition={{ duration: 0.1 }}
        >
          {children}
        </motion.span>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        whileHover={isDisabled ? undefined : { y: -0.5 }}
        whileTap={isDisabled ? undefined : { y: 0 }}
        transition={{ duration: 0.1 }}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
