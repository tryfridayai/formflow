'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast, ToastItem } from './toast';
import { cn } from '@/lib/utils/cn';

export interface ToasterProps {
  className?: string;
}

export function Toaster({ className }: ToasterProps) {
  const { toasts, removeToast } = useToast();

  return (
    <div
      aria-label="Notifications"
      className={cn(
        'pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2',
        className
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <ToastItem toast={toast} onDismiss={removeToast} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
