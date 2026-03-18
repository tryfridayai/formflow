'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { Question, TextProperties } from '@/lib/types/form';

interface LongTextFieldProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  answerColor: string;
}

export function LongTextField({
  question,
  value,
  onChange,
  onSubmit,
  answerColor,
}: LongTextFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const config = question.properties.config as TextProperties;

  useEffect(() => {
    const timer = setTimeout(() => textareaRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl+Enter to submit
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          resize();
        }}
        onKeyDown={handleKeyDown}
        placeholder={config?.placeholder ?? 'Type your answer here...'}
        maxLength={config?.max_length}
        rows={3}
        className="w-full resize-none border-0 border-b-2 bg-transparent pb-2 text-xl font-medium outline-none transition-colors placeholder:opacity-30 focus:ring-0 sm:text-2xl"
        style={{
          color: answerColor,
          borderBottomColor: `${answerColor}40`,
          caretColor: answerColor,
          overflow: 'hidden',
        }}
        autoComplete="off"
      />
      <p className="text-xs opacity-30" style={{ color: answerColor }}>
        Shift + Enter for new line
      </p>
    </div>
  );
}
