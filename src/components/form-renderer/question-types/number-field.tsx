'use client';

import { useEffect, useRef } from 'react';
import type { Question, NumberProperties } from '@/lib/types/form';

interface NumberFieldProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  answerColor: string;
}

export function NumberField({
  question,
  value,
  onChange,
  onSubmit,
  answerColor,
}: NumberFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const config = question.properties.config as NumberProperties;

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
      type="number"
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={config?.placeholder ?? 'Type a number...'}
      min={config?.min}
      max={config?.max}
      className="w-full border-0 border-b-2 bg-transparent pb-2 text-2xl font-medium outline-none transition-colors placeholder:opacity-30 focus:ring-0 sm:text-3xl [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      style={{
        color: answerColor,
        borderBottomColor: `${answerColor}40`,
        caretColor: answerColor,
      }}
      autoComplete="off"
    />
  );
}
