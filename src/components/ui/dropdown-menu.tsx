'use client';

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

/* ----------------------------- Context ------------------------------- */

interface DropdownContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error('DropdownMenu compound components must be used within DropdownMenu');
  return ctx;
}

/* -------------------------------- Root -------------------------------- */

export interface DropdownMenuProps {
  children: React.ReactNode;
}

function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
}

/* ------------------------------ Trigger ------------------------------ */

export interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

function DropdownMenuTrigger({
  children,
  className,
}: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerRef } = useDropdownContext();

  return (
    <button
      ref={triggerRef}
      className={className}
      onClick={() => setOpen(!open)}
      aria-haspopup="menu"
      aria-expanded={open}
    >
      {children}
    </button>
  );
}

/* ------------------------------ Content ------------------------------ */

export interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom';
}

function DropdownMenuContent({
  children,
  className,
  align = 'start',
  side = 'bottom',
}: DropdownMenuContentProps) {
  const { open, setOpen } = useDropdownContext();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.closest('.relative')?.contains(e.target as Node)) {
        setOpen(false);
      }
    },
    [setOpen]
  );

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    },
    [setOpen]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, handleClickOutside, handleEscape]);

  const alignClass = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  }[align];

  const sideClass = side === 'top' ? 'bottom-full mb-1' : 'top-full mt-1';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={menuRef}
          role="menu"
          className={cn(
            'absolute z-50 min-w-[180px] rounded-lg border border-gray-200 bg-white p-1 shadow-lg',
            'dark:border-gray-800 dark:bg-gray-950',
            sideClass,
            alignClass,
            className
          )}
          initial={{ opacity: 0, y: side === 'top' ? 4 : -4, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: side === 'top' ? 4 : -4, scale: 0.96 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------- Item -------------------------------- */

export interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  destructive?: boolean;
  onSelect?: () => void;
}

function DropdownMenuItem({
  children,
  className,
  disabled = false,
  destructive = false,
  onSelect,
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownContext();

  return (
    <button
      role="menuitem"
      disabled={disabled}
      className={cn(
        'flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors duration-150',
        'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
        'focus-visible:outline-none focus-visible:bg-gray-100 dark:focus-visible:bg-gray-800',
        destructive &&
          'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
      onClick={() => {
        onSelect?.();
        setOpen(false);
      }}
    >
      {children}
    </button>
  );
}

/* ----------------------------- Separator ------------------------------ */

function DropdownMenuSeparator({ className }: { className?: string }) {
  return (
    <div
      role="separator"
      className={cn(
        '-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-800',
        className
      )}
    />
  );
}

/* ------------------------------- Label ------------------------------- */

function DropdownMenuLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400',
        className
      )}
    >
      {children}
    </div>
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};
