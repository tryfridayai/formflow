'use client';

import React, { useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils/cn';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { DropdownProperties, ChoiceOption } from '@/lib/types/form';

interface DropdownEditorProps {
  properties: DropdownProperties;
  onChange: (properties: DropdownProperties) => void;
}

export function DropdownEditor({
  properties,
  onChange,
}: DropdownEditorProps) {
  const handleChoiceChange = useCallback(
    (index: number, label: string) => {
      const updated = [...properties.choices];
      updated[index] = {
        ...updated[index],
        label,
        value: label.toLowerCase().replace(/\s+/g, '_'),
      };
      onChange({ ...properties, choices: updated });
    },
    [properties, onChange]
  );

  const handleAddChoice = useCallback(() => {
    const newChoice: ChoiceOption = {
      id: uuidv4(),
      label: `Option ${properties.choices.length + 1}`,
      value: `option_${properties.choices.length + 1}`,
    };
    onChange({ ...properties, choices: [...properties.choices, newChoice] });
  }, [properties, onChange]);

  const handleRemoveChoice = useCallback(
    (index: number) => {
      if (properties.choices.length <= 1) return;
      const updated = properties.choices.filter((_, i) => i !== index);
      onChange({ ...properties, choices: updated });
    },
    [properties, onChange]
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
          Options
        </label>
        <div className="space-y-2">
          {properties.choices.map((choice, index) => (
            <div key={choice.id} className="group flex items-center gap-2">
              <span className="w-5 shrink-0 text-center text-xs text-gray-400 dark:text-gray-500">
                {index + 1}
              </span>
              <input
                type="text"
                value={choice.label}
                onChange={(e) => handleChoiceChange(index, e.target.value)}
                className={cn(
                  'flex h-8 flex-1 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900',
                  'transition-colors duration-150',
                  'focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
                  'dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100'
                )}
                placeholder={`Option ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => handleRemoveChoice(index)}
                disabled={properties.choices.length <= 1}
                className={cn(
                  'rounded-md p-1 text-gray-400 opacity-0 transition-all duration-150',
                  'hover:bg-red-50 hover:text-red-600',
                  'dark:hover:bg-red-950 dark:hover:text-red-400',
                  'group-hover:opacity-100',
                  'disabled:cursor-not-allowed disabled:opacity-30'
                )}
                aria-label={`Remove option ${choice.label}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={handleAddChoice}
        >
          <Plus className="h-3.5 w-3.5" />
          Add option
        </Button>
      </div>

      <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
        <Input
          label="Placeholder text"
          value={properties.placeholder || ''}
          onChange={(e) =>
            onChange({ ...properties, placeholder: e.target.value })
          }
          placeholder="Select an option..."
        />
      </div>

      <Switch
        checked={properties.alphabetical_order}
        onCheckedChange={(checked) =>
          onChange({ ...properties, alphabetical_order: checked })
        }
        label="Sort alphabetically"
      />
    </div>
  );
}
