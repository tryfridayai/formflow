'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, ThumbsUp, Circle } from 'lucide-react';
import type { Question, RatingProperties } from '@/lib/types/form';

interface RatingFieldProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  answerColor: string;
}

const SHAPES = {
  star: Star,
  heart: Heart,
  thumbsup: ThumbsUp,
  circle: Circle,
};

export function RatingField({
  question,
  value,
  onChange,
  onSubmit,
  answerColor,
}: RatingFieldProps) {
  const config = question.properties.config as RatingProperties;
  const steps = config?.steps ?? 5;
  const shape = config?.shape ?? 'star';
  const Icon = SHAPES[shape] ?? Star;
  const [hovered, setHovered] = useState<number | null>(null);
  const currentRating = value ? parseInt(value, 10) : 0;

  const handleSelect = useCallback(
    (rating: number) => {
      onChange(String(rating));
      setTimeout(() => onSubmit(), 400);
    },
    [onChange, onSubmit]
  );

  // Keyboard support: number keys
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA'
      )
        return;

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= steps && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleSelect(num);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [steps, handleSelect]);

  const displayRating = hovered ?? currentRating;

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: steps }, (_, i) => {
        const rating = i + 1;
        const isFilled = rating <= displayRating;

        return (
          <motion.button
            key={rating}
            type="button"
            onClick={() => handleSelect(rating)}
            onMouseEnter={() => setHovered(rating)}
            onMouseLeave={() => setHovered(null)}
            className="relative p-1 transition-all focus:outline-none"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            aria-label={`Rate ${rating} of ${steps}`}
          >
            <Icon
              className="h-10 w-10 transition-all sm:h-12 sm:w-12"
              style={{
                color: isFilled ? answerColor : `${answerColor}30`,
                fill: isFilled ? answerColor : 'transparent',
              }}
              strokeWidth={1.5}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
