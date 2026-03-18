'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface DialogContextValue {
  open: boolean;
  onClose: () => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error('Dialog compound components must be used within Dialog');
  return ctx;
}

/* -------------------------------- Root -------------------------------- */

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Dialog({ open, onClose, children }: DialogProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <DialogContext.Provider value={{ open, onClose }}>
      <AnimatePresence>{open && children}</AnimatePresence>
    </DialogContext.Provider>,
    document.body
  );
}

/* ------------------------------ Overlay ------------------------------ */

function DialogOverlay({ className }: { className?: string }) {
  const { onClose } = useDialogContext();
  return (
    <motion.div
      className={cn(
        'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm',
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      aria-hidden="true"
    />
  );
}

/* ------------------------------ Content ------------------------------ */

export interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

function DialogContent({ children, className }: DialogContentProps) {
  const { onClose } = useDialogContext();
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <DialogOverlay />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          ref={contentRef}
          role="dialog"
          aria-modal="true"
          className={cn(
            'relative w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-lg',
            'dark:border-gray-800 dark:bg-gray-950',
            className
          )}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className={cn(
              'absolute right-4 top-4 rounded-md p-1 text-gray-400 transition-colors duration-150',
              'hover:bg-gray-100 hover:text-gray-600',
              'dark:hover:bg-gray-800 dark:hover:text-gray-300',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20'
            )}
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
          {children}
        </motion.div>
      </div>
    </>
  );
}

/* ------------------------------ Header ------------------------------- */

function DialogHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-4 flex flex-col gap-1', className)}>{children}</div>
  );
}

/* ------------------------------- Title ------------------------------- */

function DialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        'text-lg font-semibold text-gray-900 dark:text-gray-100',
        className
      )}
    >
      {children}
    </h2>
  );
}

/* ----------------------------- Description --------------------------- */

function DialogDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-sm text-gray-500 dark:text-gray-400', className)}>
      {children}
    </p>
  );
}

/* ------------------------------- Footer ------------------------------ */

function DialogFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mt-6 flex items-center justify-end gap-2',
        className
      )}
    >
      {children}
    </div>
  );
}

export {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};
