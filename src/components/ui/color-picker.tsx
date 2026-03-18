'use client';

import React, { useState, useCallback } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const DEFAULT_SWATCHES = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#64748b', // slate
  '#1e293b', // dark slate
];

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  swatches?: string[];
  showHexInput?: boolean;
  className?: string;
}

const HEX_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function ColorPicker({
  value,
  onChange,
  swatches = DEFAULT_SWATCHES,
  showHexInput = true,
  className,
}: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(value);

  const handleHexChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      if (!val.startsWith('#')) val = `#${val}`;
      setHexInput(val);

      if (HEX_REGEX.test(val)) {
        onChange(val);
      }
    },
    [onChange]
  );

  const handleSwatchClick = useCallback(
    (color: string) => {
      onChange(color);
      setHexInput(color);
    },
    [onChange]
  );

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="grid grid-cols-6 gap-2" role="radiogroup" aria-label="Color swatches">
        {swatches.map((color) => {
          const isSelected = value.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={color}
              onClick={() => handleSwatchClick(color)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150',
                'hover:scale-110',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:ring-offset-1',
                isSelected && 'ring-2 ring-gray-900/20 dark:ring-white/20'
              )}
              style={{ backgroundColor: color }}
            >
              {isSelected && (
                <Check
                  className="h-4 w-4"
                  style={{
                    color: isLightColor(color) ? '#1e293b' : '#ffffff',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {showHexInput && (
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 shrink-0 rounded-lg border border-gray-200 dark:border-gray-800"
            style={{ backgroundColor: HEX_REGEX.test(hexInput) ? hexInput : value }}
          />
          <input
            type="text"
            value={hexInput}
            onChange={handleHexChange}
            placeholder="#000000"
            maxLength={7}
            className={cn(
              'flex h-8 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-mono text-gray-900',
              'placeholder:text-gray-400',
              'transition-colors duration-150',
              'focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-1',
              'dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100'
            )}
            aria-label="Hex color value"
          />
        </div>
      )}
    </div>
  );
}

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const full = c.length === 3 ? c.split('').map((ch) => ch + ch).join('') : c;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

ColorPicker.displayName = 'ColorPicker';

export { ColorPicker };
