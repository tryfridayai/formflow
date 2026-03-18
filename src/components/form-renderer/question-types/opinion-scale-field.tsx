'use client';

import { useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Question, OpinionScaleProperties } from '@/lib/types/form';
import { cn } from '@/lib/utils/cn';

interface OpinionScaleFieldProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  answerColor: string;
  questionColor: string;
}

export function OpinionScaleField({
  question,
  value,
  onChange,
  onSubmit,
  answerColor,
  questionColor,
}: OpinionScaleFieldProps) {
  const config = question.properties.config as OpinionScaleProperties;
  const steps = config?.steps ?? 10;
  const startAtZero = config?.start_at_zero ?? false;
  const labels = config?.labels ?? {};

  const numbers = Array.from({ length: steps }, (_, i) =>
    startAtZero ? i : i + 1
  );

  const handleSelect = useCallback(
    (num: number) => {
      onChange(String(num));
      setTimeout(() => onSubmit(), 300);
    },
    [onChange, onSubmit]
  );

  // Keyboard: number keys
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const num = parseInt(e.key, 10);
      if (!isNaN(num) && numbers.includes(num) && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleSelect(num);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [numbers, handleSelect]);

  const selectedNum = value ? parseInt(value, 10) : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {numbers.map((num, index) => {
          const isSelected = selectedNum === num;
          return (
            <motion.button
              key={num}
              type="button"
              onClick={() => handleSelect(num)}
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-lg border-2 text-lg font-bold transition-all sm:h-14 sm:w-14 sm:text-xl'
              )}
              style={{
                borderColor: isSelected ? answerColor : `${questionColor}25`,
                backgroundColor: isSelected ? answerColor : 'transparent',
                color: isSelected ? '#fff' : questionColor,
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {num}
            </motion.button>
          );
        })}
      </div>

      {/* Labels */}
      {(labels.left || labels.center || labels.right) && (
        <div className="flex items-center justify-between">
          <span
            className="text-xs opacity-50"
            style={{ color: questionColor }}
          >
            {labels.left ?? ''}
          </span>
          {labels.center && (
            <span
              className="text-xs opacity-50"
              style={{ color: questionColor }}
            >
              {labels.center}
            </span>
          )}
          <span
            className="text-xs opacity-50"
            style={{ color: questionColor }}
          >
            {labels.right ?? ''}
          </span>
        </div>
      )}
    </div>
  );
}
