'use client';

import { useEffect, useRef } from 'react';
import type { Question, TextProperties } from '@/lib/types/form';

interface ShortTextFieldProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  answerColor: string;
}

export function ShortTextField({
  question,
  value,
  onChange,
  onSubmit,
  answerColor,
}: ShortTextFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const config = question.properties.config as TextProperties;

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={config?.placeholder ?? 'Type your answer here...'}
      maxLength={config?.max_length}
      className="w-full border-0 border-b-2 bg-transparent pb-2 text-2xl font-medium outline-none transition-colors placeholder:opacity-30 focus:ring-0 sm:text-3xl"
      style={{
        color: answerColor,
        borderBottomColor: `${answerColor}40`,
        caretColor: answerColor,
      }}
      autoComplete="off"
      spellCheck={false}
    />
  );
}
