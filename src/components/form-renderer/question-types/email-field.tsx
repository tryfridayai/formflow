'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import type { Question, EmailProperties } from '@/lib/types/form';

interface EmailFieldProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  answerColor: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailField({
  question,
  value,
  onChange,
  onSubmit,
  answerColor,
}: EmailFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const config = question.properties.config as EmailProperties;

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const isValid = useMemo(() => {
    if (!value) return null;
    return EMAIL_REGEX.test(value);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={config?.placeholder ?? 'name@example.com'}
        className="w-full border-0 border-b-2 bg-transparent pb-2 pr-10 text-2xl font-medium outline-none transition-colors placeholder:opacity-30 focus:ring-0 sm:text-3xl"
        style={{
          color: answerColor,
          borderBottomColor: `${answerColor}40`,
          caretColor: answerColor,
        }}
        autoComplete="email"
      />
      {isValid !== null && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          {isValid ? (
            <Check className="h-6 w-6 text-emerald-400" />
          ) : (
            <AlertCircle className="h-6 w-6 text-red-400" />
          )}
        </div>
      )}
    </div>
  );
}
