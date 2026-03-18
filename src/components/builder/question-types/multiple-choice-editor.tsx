'use client';

import React, { useCallback, useRef } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type {
  MultipleChoiceProperties,
  ChoiceOption,
} from '@/lib/types/form';

interface MultipleChoiceEditorProps {
  properties: MultipleChoiceProperties;
  onChange: (properties: MultipleChoiceProperties) => void;
}

export function MultipleChoiceEditor({
  properties,
  onChange,
}: MultipleChoiceEditorProps) {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

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

  const handleDragStart = useCallback((_e: React.DragEvent, index: number) => {
    dragItem.current = index;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverItem.current = index;
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (dragItem.current === null || dragOverItem.current === null) return;
      if (dragItem.current === dragOverItem.current) return;

      const reordered = [...properties.choices];
      const [removed] = reordered.splice(dragItem.current, 1);
      reordered.splice(dragOverItem.current, 0, removed);

      onChange({ ...properties, choices: reordered });
      dragItem.current = null;
      dragOverItem.current = null;
    },
    [properties, onChange]
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
          Choices
        </label>
        <div className="space-y-2">
          {properties.choices.map((choice, index) => (
            <div
              key={choice.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={handleDrop}
              className="group flex items-center gap-2"
            >
              <div className="cursor-grab text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-600">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-gray-300 text-xs text-gray-500 dark:border-gray-600 dark:text-gray-400">
                {String.fromCharCode(65 + index)}
              </div>
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
          Add choice
        </Button>
      </div>

      <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-800">
        <Switch
          checked={properties.allow_multiple}
          onCheckedChange={(checked) =>
            onChange({ ...properties, allow_multiple: checked })
          }
          label="Allow multiple selections"
        />

        <Switch
          checked={properties.other_option}
          onCheckedChange={(checked) =>
            onChange({ ...properties, other_option: checked })
          }
          label='Include "Other" option'
        />

        <Switch
          checked={properties.randomize}
          onCheckedChange={(checked) =>
            onChange({ ...properties, randomize: checked })
          }
          label="Randomize order"
        />
      </div>
    </div>
  );
}
