'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { OpinionScaleProperties } from '@/lib/types/form';

const STEPS_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  label: String(i + 2),
  value: String(i + 2),
}));

interface OpinionScaleEditorProps {
  properties: OpinionScaleProperties;
  onChange: (properties: OpinionScaleProperties) => void;
}

export function OpinionScaleEditor({
  properties,
  onChange,
}: OpinionScaleEditorProps) {
  const startValue = properties.start_at_zero ? 0 : 1;

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

      <Switch
        checked={properties.start_at_zero}
        onCheckedChange={(checked) =>
          onChange({ ...properties, start_at_zero: checked })
        }
        label="Start at zero"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Left label (min)"
          value={properties.labels.left || ''}
          onChange={(e) =>
            onChange({
              ...properties,
              labels: { ...properties.labels, left: e.target.value },
            })
          }
          placeholder="Not likely"
        />
        <Input
          label="Right label (max)"
          value={properties.labels.right || ''}
          onChange={(e) =>
            onChange({
              ...properties,
              labels: { ...properties.labels, right: e.target.value },
            })
          }
          placeholder="Very likely"
        />
      </div>

      <Input
        label="Center label (optional)"
        value={properties.labels.center || ''}
        onChange={(e) =>
          onChange({
            ...properties,
            labels: { ...properties.labels, center: e.target.value },
          })
        }
        placeholder="Neutral"
      />

      <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
        <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
          Preview
        </label>
        <div className="flex items-end justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {properties.labels.left || 'Min'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {properties.labels.right || 'Max'}
          </span>
        </div>
        <div className="mt-1 flex gap-1">
          {Array.from({ length: properties.steps }).map((_, i) => {
            const val = startValue + i;
            return (
              <div
                key={i}
                className={cn(
                  'flex h-9 flex-1 items-center justify-center rounded-md border text-sm font-medium transition-colors',
                  i === Math.floor(properties.steps / 2)
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400'
                    : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400'
                )}
              >
                {val}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
