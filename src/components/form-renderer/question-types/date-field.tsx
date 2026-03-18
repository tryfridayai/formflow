'use client';

import { useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';
import type { Question } from '@/lib/types/form';

interface DateFieldProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  answerColor: string;
}

export function DateField({
  value,
  onChange,
  onSubmit,
  answerColor,
}: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="relative w-full max-w-sm">
      <Calendar
        className="absolute left-0 top-1/2 -translate-y-1/2 opacity-40"
        style={{ color: answerColor }}
        size={22}
      />
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full border-0 border-b-2 bg-transparent pb-2 pl-9 text-2xl font-medium outline-none transition-colors placeholder:opacity-30 focus:ring-0 sm:text-3xl [&::-webkit-calendar-picker-indicator]:opacity-0"
        style={{
          color: answerColor,
          borderBottomColor: `${answerColor}40`,
          caretColor: answerColor,
          colorScheme: 'dark',
        }}
      />
    </div>
  );
}
