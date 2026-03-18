'use client';

import { useEffect, useRef } from 'react';
import { Phone } from 'lucide-react';
import type { Question, PhoneProperties } from '@/lib/types/form';

interface PhoneFieldProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  answerColor: string;
}

export function PhoneField({
  question,
  value,
  onChange,
  onSubmit,
  answerColor,
}: PhoneFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const config = question.properties.config as PhoneProperties;

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
    <div className="relative">
      <Phone
        className="absolute left-0 top-1/2 -translate-y-1/2 opacity-40"
        style={{ color: answerColor }}
        size={22}
      />
      <input
        ref={inputRef}
        type="tel"
        inputMode="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={config?.placeholder ?? '(555) 000-0000'}
        className="w-full border-0 border-b-2 bg-transparent pb-2 pl-9 text-2xl font-medium outline-none transition-colors placeholder:opacity-30 focus:ring-0 sm:text-3xl"
        style={{
          color: answerColor,
          borderBottomColor: `${answerColor}40`,
          caretColor: answerColor,
        }}
        autoComplete="tel"
      />
    </div>
  );
}
