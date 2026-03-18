'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import type { Question, DropdownProperties } from '@/lib/types/form';

interface DropdownFieldProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  answerColor: string;
}

export function DropdownField({
  question,
  value,
  onChange,
  onSubmit,
  answerColor,
}: DropdownFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const config = question.properties.config as DropdownProperties;
  const choices = config?.choices ?? [];

  const filtered = search
    ? choices.filter((c) =>
        c.label.toLowerCase().includes(search.toLowerCase())
      )
    : choices;

  const selectedLabel = choices.find((c) => c.value === value)?.label ?? '';

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleSelect = (choiceValue: string) => {
    onChange(choiceValue);
    setIsOpen(false);
    setSearch('');
    setTimeout(() => onSubmit(), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isOpen) {
      e.preventDefault();
      if (value) onSubmit();
      else setIsOpen(true);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div
        className="flex cursor-pointer items-center gap-2 border-0 border-b-2 bg-transparent pb-2"
        style={{ borderBottomColor: `${answerColor}40` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? search : selectedLabel}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={config?.placeholder ?? 'Choose an option...'}
          className="flex-1 bg-transparent text-2xl font-medium outline-none placeholder:opacity-30"
          style={{ color: answerColor, caretColor: answerColor }}
          autoComplete="off"
        />
        <ChevronDown
          className="h-6 w-6 shrink-0 transition-transform"
          style={{
            color: `${answerColor}60`,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {filtered.length === 0 ? (
              <div
                className="px-4 py-3 text-sm opacity-40"
                style={{ color: answerColor }}
              >
                No options found
              </div>
            ) : (
              filtered.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => handleSelect(choice.value)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-base transition-colors hover:bg-white/10"
                  style={{ color: answerColor }}
                >
                  <span>{choice.label}</span>
                  {value === choice.value && (
                    <Check className="h-4 w-4" style={{ color: answerColor }} />
                  )}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
