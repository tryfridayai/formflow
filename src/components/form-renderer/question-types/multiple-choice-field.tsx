'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { Question, MultipleChoiceProperties } from '@/lib/types/form';
import { cn } from '@/lib/utils/cn';

interface MultipleChoiceFieldProps {
  question: Question;
  value: string[];
  onChange: (value: string[]) => void;
  onSubmit: () => void;
  answerColor: string;
  questionColor: string;
}

export function MultipleChoiceField({
  question,
  value,
  onChange,
  onSubmit,
  answerColor,
  questionColor,
}: MultipleChoiceFieldProps) {
  const config = question.properties.config as MultipleChoiceProperties;
  const choices = useMemo(() => config?.choices ?? [], [config?.choices]);
  const allowMultiple = config?.allow_multiple ?? false;

  const handleSelect = useCallback(
    (choiceValue: string) => {
      if (allowMultiple) {
        const next = value.includes(choiceValue)
          ? value.filter((v) => v !== choiceValue)
          : [...value, choiceValue];
        onChange(next);
      } else {
        onChange([choiceValue]);
        // Auto-advance on single select after a short delay
        setTimeout(() => onSubmit(), 300);
      }
    },
    [allowMultiple, value, onChange, onSubmit]
  );

  // Keyboard shortcuts: 1-9 and A-Z
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      )
        return;

      // Number keys
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= choices.length) {
        e.preventDefault();
        handleSelect(choices[num - 1].value);
        return;
      }

      // Letter keys A-Z
      const letterIndex = e.key.toUpperCase().charCodeAt(0) - 65;
      if (
        letterIndex >= 0 &&
        letterIndex < choices.length &&
        e.key.length === 1 &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        handleSelect(choices[letterIndex].value);
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [choices, handleSelect]);

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return (
    <div className="flex flex-col gap-3">
      {allowMultiple && (
        <p className="text-xs opacity-40" style={{ color: questionColor }}>
          Choose as many as you like
        </p>
      )}
      <div className="flex flex-col gap-2">
        {choices.map((choice, index) => {
          const isSelected = value.includes(choice.value);
          return (
            <motion.button
              key={choice.id}
              type="button"
              onClick={() => handleSelect(choice.value)}
              className={cn(
                'group flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all',
                isSelected
                  ? 'shadow-md'
                  : 'hover:shadow-sm'
              )}
              style={{
                borderColor: isSelected ? answerColor : `${questionColor}20`,
                backgroundColor: isSelected ? `${answerColor}15` : 'transparent',
                color: questionColor,
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition-all',
                  isSelected ? 'border-transparent' : 'border-current opacity-40'
                )}
                style={{
                  backgroundColor: isSelected ? answerColor : 'transparent',
                  color: isSelected ? '#fff' : questionColor,
                }}
              >
                {isSelected ? (
                  <Check className="h-4 w-4" />
                ) : (
                  LETTERS[index] ?? index + 1
                )}
              </span>
              <span className="text-base font-medium sm:text-lg">
                {choice.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
