'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useBuilderContext } from '@/lib/store/builder-context';
import { QUESTION_TYPE_DEFINITIONS } from '@/lib/utils/constants';
import { MultipleChoiceEditor } from './question-types/multiple-choice-editor';
import { DropdownEditor } from './question-types/dropdown-editor';
import { RatingEditor } from './question-types/rating-editor';
import { OpinionScaleEditor } from './question-types/opinion-scale-editor';
import { WelcomeScreenEditor } from './question-types/welcome-screen-editor';
import { EndScreenEditor } from './question-types/end-screen-editor';
import type { Question, QuestionProperties } from '@/lib/types/form';

interface QuestionEditorProps {
  question: Question | null;
  onSave: (questionId: string, data: Partial<Question>) => void;
}

export function QuestionEditor({ question, onSave }: QuestionEditorProps) {
  const { setUnsavedChanges } = useBuilderContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [required, setRequired] = useState(false);
  const [properties, setProperties] = useState<QuestionProperties | null>(null);

  // Sync local state when question changes
  useEffect(() => {
    if (question) {
      setTitle(question.title);
      setDescription(question.description || '');
      setRequired(question.required);
      setProperties(question.properties);
    }
  }, [question]); // Re-sync when question changes

  // Debounce title
  const debouncedTitle = useDebounce(title, 800);
  const debouncedDescription = useDebounce(description, 800);

  // Auto-save title changes
  useEffect(() => {
    if (!question) return;
    if (debouncedTitle === question.title) return;
    onSave(question.id, { title: debouncedTitle });
    setUnsavedChanges(false);
  }, [debouncedTitle]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save description changes
  useEffect(() => {
    if (!question) return;
    if (debouncedDescription === (question.description || '')) return;
    onSave(question.id, { description: debouncedDescription });
    setUnsavedChanges(false);
  }, [debouncedDescription]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      setUnsavedChanges(true);
    },
    [setUnsavedChanges]
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(e.target.value);
      setUnsavedChanges(true);
    },
    [setUnsavedChanges]
  );

  const handleRequiredChange = useCallback(
    (checked: boolean) => {
      setRequired(checked);
      if (question) {
        onSave(question.id, { required: checked });
      }
    },
    [question, onSave]
  );

  const handlePropertiesChange = useCallback(
    (newConfig: Record<string, unknown>) => {
      if (!question || !properties) return;
      const updatedProperties = {
        type: properties.type,
        config: newConfig,
      } as QuestionProperties;
      setProperties(updatedProperties);
      setUnsavedChanges(true);
      // Save properties immediately (type-specific editors handle their own UX)
      onSave(question.id, { properties: updatedProperties });
    },
    [question, properties, onSave, setUnsavedChanges]
  );

  if (!question) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select a question to edit
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Or add a new question from the sidebar
          </p>
        </div>
      </div>
    );
  }

  const definition = QUESTION_TYPE_DEFINITIONS[question.type];
  const isLayout =
    question.type === 'welcome_screen' || question.type === 'end_screen';

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl p-6">
        {/* Question type badge */}
        <div className="mb-6">
          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            {definition.label}
          </span>
        </div>

        {/* Title */}
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder={isLayout ? 'Screen title...' : 'Your question...'}
            className={cn(
              'w-full border-none bg-transparent text-xl font-semibold text-gray-900 outline-none',
              'placeholder:text-gray-300',
              'dark:text-gray-100 dark:placeholder:text-gray-600'
            )}
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Add a description (optional)"
            rows={2}
            className={cn(
              'w-full resize-none border-none bg-transparent text-sm text-gray-600 outline-none',
              'placeholder:text-gray-300',
              'dark:text-gray-400 dark:placeholder:text-gray-600'
            )}
          />
        </div>

        {/* Required toggle (not for layout types) */}
        {!isLayout && (
          <div className="mb-6 border-t border-gray-200 pt-4 dark:border-gray-800">
            <Switch
              checked={required}
              onCheckedChange={handleRequiredChange}
              label="Required"
            />
          </div>
        )}

        {/* Type-specific settings */}
        <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {isLayout ? 'Screen Settings' : 'Question Settings'}
          </h3>
          {renderTypeEditor(question, properties, handlePropertiesChange)}
        </div>
      </div>
    </div>
  );
}

function renderTypeEditor(
  question: Question,
  properties: QuestionProperties | null,
  onChange: (config: Record<string, unknown>) => void
) {
  if (!properties) return null;

  const config = properties.config;

  switch (question.type) {
    case 'multiple_choice':
      return (
        <MultipleChoiceEditor
          properties={config as import('@/lib/types/form').MultipleChoiceProperties}
          onChange={(props) => onChange(props as unknown as Record<string, unknown>)}
        />
      );
    case 'dropdown':
      return (
        <DropdownEditor
          properties={config as import('@/lib/types/form').DropdownProperties}
          onChange={(props) => onChange(props as unknown as Record<string, unknown>)}
        />
      );
    case 'rating':
      return (
        <RatingEditor
          properties={config as import('@/lib/types/form').RatingProperties}
          onChange={(props) => onChange(props as unknown as Record<string, unknown>)}
        />
      );
    case 'opinion_scale':
      return (
        <OpinionScaleEditor
          properties={config as import('@/lib/types/form').OpinionScaleProperties}
          onChange={(props) => onChange(props as unknown as Record<string, unknown>)}
        />
      );
    case 'welcome_screen':
      return (
        <WelcomeScreenEditor
          properties={config as import('@/lib/types/form').WelcomeScreenProperties}
          onChange={(props) => onChange(props as unknown as Record<string, unknown>)}
        />
      );
    case 'end_screen':
      return (
        <EndScreenEditor
          properties={config as import('@/lib/types/form').EndScreenProperties}
          onChange={(props) => onChange(props as unknown as Record<string, unknown>)}
        />
      );
    case 'short_text':
    case 'long_text':
      return (
        <TextSettingsEditor
          placeholder={(config as { placeholder?: string }).placeholder || ''}
          maxLength={(config as { max_length?: number }).max_length}
          onChange={onChange}
        />
      );
    case 'number':
      return (
        <NumberSettingsEditor
          config={config as import('@/lib/types/form').NumberProperties}
          onChange={onChange}
        />
      );
    default:
      return (
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No additional settings for this question type.
        </p>
      );
  }
}

/* ---- Inline mini-editors for simpler types ---- */

function TextSettingsEditor({
  placeholder,
  maxLength,
  onChange,
}: {
  placeholder: string;
  maxLength?: number;
  onChange: (config: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-4">
      <Input
        label="Placeholder text"
        value={placeholder}
        onChange={(e) =>
          onChange({ placeholder: e.target.value, max_length: maxLength })
        }
        placeholder="Type your answer here..."
      />
      <Input
        label="Max character length"
        type="number"
        value={String(maxLength || '')}
        onChange={(e) =>
          onChange({
            placeholder,
            max_length: e.target.value ? parseInt(e.target.value, 10) : undefined,
          })
        }
        placeholder="255"
      />
    </div>
  );
}

function NumberSettingsEditor({
  config,
  onChange,
}: {
  config: import('@/lib/types/form').NumberProperties;
  onChange: (cfg: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-4">
      <Input
        label="Placeholder text"
        value={config.placeholder || ''}
        onChange={(e) =>
          onChange({ ...config, placeholder: e.target.value })
        }
        placeholder="Type a number..."
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Minimum value"
          type="number"
          value={config.min !== undefined ? String(config.min) : ''}
          onChange={(e) =>
            onChange({
              ...config,
              min: e.target.value ? parseInt(e.target.value, 10) : undefined,
            })
          }
          placeholder="No min"
        />
        <Input
          label="Maximum value"
          type="number"
          value={config.max !== undefined ? String(config.max) : ''}
          onChange={(e) =>
            onChange({
              ...config,
              max: e.target.value ? parseInt(e.target.value, 10) : undefined,
            })
          }
          placeholder="No max"
        />
      </div>
    </div>
  );
}
