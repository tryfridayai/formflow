'use client';

import { useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Question, YesNoProperties } from '@/lib/types/form';

interface YesNoFieldProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  answerColor: string;
  questionColor: string;
}

export function YesNoField({
  question,
  value,
  onChange,
  onSubmit,
  answerColor,
  questionColor,
}: YesNoFieldProps) {
  const config = question.properties.config as YesNoProperties;
  const yesLabel = config?.positive_label ?? 'Yes';
  const noLabel = config?.negative_label ?? 'No';

  const handleSelect = useCallback(
    (answer: string) => {
      onChange(answer);
      setTimeout(() => onSubmit(), 300);
    },
    [onChange, onSubmit]
  );

  // Keyboard Y / N
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();
      if (key === 'y') {
        e.preventDefault();
        handleSelect('yes');
      } else if (key === 'n') {
        e.preventDefault();
        handleSelect('no');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleSelect]);

  const buttons = [
    { answer: 'yes', label: yesLabel, Icon: ThumbsUp, key: 'Y' },
    { answer: 'no', label: noLabel, Icon: ThumbsDown, key: 'N' },
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
      {buttons.map(({ answer, label, Icon, key }, index) => {
        const isSelected = value === answer;
        return (
          <motion.button
            key={answer}
            type="button"
            onClick={() => handleSelect(answer)}
            className="group flex flex-1 items-center justify-center gap-3 rounded-xl border-2 px-8 py-5 text-lg font-bold transition-all"
            style={{
              borderColor: isSelected ? answerColor : `${questionColor}20`,
              backgroundColor: isSelected ? `${answerColor}15` : 'transparent',
              color: isSelected ? answerColor : questionColor,
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Icon className="h-6 w-6" />
            <span>{label}</span>
            <kbd
              className="ml-2 rounded border px-1.5 py-0.5 text-xs font-normal opacity-40"
              style={{
                borderColor: `${questionColor}30`,
                color: questionColor,
              }}
            >
              {key}
            </kbd>
          </motion.button>
        );
      })}
    </div>
  );
}
