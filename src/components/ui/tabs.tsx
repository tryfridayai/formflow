'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

/* ------------------------------ Context ------------------------------ */

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs compound components must be used within Tabs');
  return ctx;
}

/* -------------------------------- Root -------------------------------- */

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

function Tabs({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  children,
  className,
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : uncontrolledValue;

  const handleChange = useCallback(
    (val: string) => {
      if (!isControlled) setUncontrolledValue(val);
      onValueChange?.(val);
    },
    [isControlled, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleChange }}>
      <div className={cn('flex flex-col', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

/* ------------------------------ TabList ------------------------------- */

export interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

function TabList({ children, className }: TabListProps) {
  const { value } = useTabsContext();
  const listRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const activeTab = list.querySelector<HTMLButtonElement>(
      `[data-tab-value="${value}"]`
    );
    if (activeTab) {
      const listRect = list.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - listRect.left,
        width: tabRect.width,
      });
    }
  }, [value]);

  return (
    <div
      ref={listRef}
      role="tablist"
      className={cn(
        'relative flex items-center gap-1 border-b border-gray-200 dark:border-gray-800',
        className
      )}
    >
      {children}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
        animate={indicatorStyle}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
    </div>
  );
}

/* ------------------------------ TabTrigger --------------------------- */

export interface TabTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

function TabTrigger({ value: tabValue, children, className, disabled = false }: TabTriggerProps) {
  const { value, onValueChange } = useTabsContext();
  const isActive = value === tabValue;

  return (
    <button
      role="tab"
      type="button"
      data-tab-value={tabValue}
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => onValueChange(tabValue)}
      className={cn(
        'inline-flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20',
        'disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'text-gray-900 dark:text-gray-100'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
        className
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------ TabContent --------------------------- */

export interface TabContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

function TabContent({ value: tabValue, children, className }: TabContentProps) {
  const { value } = useTabsContext();
  if (value !== tabValue) return null;

  return (
    <div
      role="tabpanel"
      className={cn('mt-3', className)}
    >
      {children}
    </div>
  );
}

export { Tabs, TabList, TabTrigger, TabContent };
