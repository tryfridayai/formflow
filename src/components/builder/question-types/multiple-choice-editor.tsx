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

  // Support both flat and nested (config) property structures
  const config = (properties as unknown as Record<string, unknown>).config as MultipleChoiceProperties | undefined;
  const choices: ChoiceOption[] = properties.choices ?? config?.choices ?? [
    { id: 'choice-1', label: 'Option 1', value: 'option_1' },
    { id: 'choice-2', label: 'Option 2', value: 'option_2' },
  ];
  const allowMultiple = properties.allow_multiple ?? config?.allow_multiple ?? false;
  const otherOption = properties.other_option ?? config?.other_option ?? false;
  const randomize = properties.randomize ?? config?.randomize ?? false;

  const updateProps = useCallback(
    (patch: Partial<MultipleChoiceProperties>) => {
      onChange({ ...properties, ...patch });
    },
    [properties, onChange]
  );

  const handleChoiceChange = useCallback(
    (index: number, label: string) => {
      const updated = [...choices];
      updated[index] = {
        ...updated[index],
        label,
        value: label.toLowerCase().replace(/\s+/g, '_'),
      };
      updateProps({ choices: updated });
    },
    [choices, updateProps]
  );

  const handleAddChoice = useCallback(() => {
    const newChoice: ChoiceOption = {
      id: uuidv4(),
      label: `Option ${choices.length + 1}`,
      value: `option_${choices.length + 1}`,
    };
    updateProps({ choices: [...choices, newChoice] });
  }, [choices, updateProps]);

  const handleRemoveChoice = useCallback(
    (index: number) => {
      if (choices.length <= 1) return;
      const updated = choices.filter((_, i) => i !== index);
      updateProps({ choices: updated });
    },
    [choices, updateProps]
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

      const reordered = [...choices];
      const [removed] = reordered.splice(dragItem.current, 1);
      reordered.splice(dragOverItem.current, 0, removed);

      updateProps({ choices: reordered });
      dragItem.current = null;
      dragOverItem.current = null;
    },
    [choices, updateProps]
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
          Choices
        </label>
        <div className="space-y-2">
          {choices.map((choice, index) => (
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
                disabled={choices.length <= 1}
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
          checked={allowMultiple}
          onCheckedChange={(checked) => updateProps({ allow_multiple: checked })}
          label="Allow multiple selections"
        />

        <Switch
          checked={otherOption}
          onCheckedChange={(checked) => updateProps({ other_option: checked })}
          label='Include "Other" option'
        />

        <Switch
          checked={randomize}
          onCheckedChange={(checked) => updateProps({ randomize: checked })}
          label="Randomize order"
        />
      </div>
    </div>
  );
}
