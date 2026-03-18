'use client';

import React from 'react';
import { Star, Heart, ThumbsUp, Circle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Select } from '@/components/ui/select';
import type { RatingProperties } from '@/lib/types/form';

const SHAPES = [
  { value: 'star', label: 'Star', icon: Star },
  { value: 'heart', label: 'Heart', icon: Heart },
  { value: 'thumbsup', label: 'Thumbs Up', icon: ThumbsUp },
  { value: 'circle', label: 'Circle', icon: Circle },
] as const;

const STEPS_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  label: String(i + 1),
  value: String(i + 1),
}));

interface RatingEditorProps {
  properties: RatingProperties;
  onChange: (properties: RatingProperties) => void;
}

export function RatingEditor({ properties, onChange }: RatingEditorProps) {
  return (
    <div className="space-y-4">
      <Select
        label="Number of steps"
        value={String(properties.steps)}
        onChange={(e) =>
          onChange({ ...properties, steps: parseInt(e.target.value, 10) })
        }
        options={STEPS_OPTIONS}
      />

      <div>
        <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
          Shape
        </label>
        <div className="grid grid-cols-4 gap-2">
          {SHAPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                onChange({
                  ...properties,
                  shape: value as RatingProperties['shape'],
                })
              }
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20',
                properties.shape === value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:border-indigo-400 dark:bg-indigo-950/30 dark:text-indigo-400'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:bg-gray-900'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
        <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
          Preview
        </label>
        <div className="flex items-center gap-1">
          {Array.from({ length: properties.steps }).map((_, i) => {
            const ShapeIcon =
              SHAPES.find((s) => s.value === properties.shape)?.icon || Star;
            return (
              <ShapeIcon
                key={i}
                className={cn(
                  'h-6 w-6 transition-colors',
                  i < Math.ceil(properties.steps / 2)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300 dark:text-gray-600'
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
