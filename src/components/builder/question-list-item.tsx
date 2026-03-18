'use client';

import React, { useCallback } from 'react';
import {
  GripVertical,
  Trash2,
  Type,
  AlignLeft,
  Mail,
  Hash,
  Phone,
  ListChecks,
  ChevronDown,
  Star,
  SlidersHorizontal,
  Calendar,
  ToggleLeft,
  Upload,
  Link,
  Hand,
  PartyPopper,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Question } from '@/lib/types/form';
import { QUESTION_TYPE_DEFINITIONS } from '@/lib/utils/constants';

const ICON_MAP: Record<string, React.ElementType> = {
  Type,
  AlignLeft,
  Mail,
  Hash,
  Phone,
  ListChecks,
  ChevronDown,
  Star,
  SlidersHorizontal,
  Calendar,
  ToggleLeft,
  Upload,
  Link,
  Hand,
  PartyPopper,
};

interface QuestionListItemProps {
  question: Question;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

export function QuestionListItem({
  question,
  index,
  isSelected,
  onSelect,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}: QuestionListItemProps) {
  const definition = QUESTION_TYPE_DEFINITIONS[question.type];
  const IconComponent = ICON_MAP[definition.icon] || Type;

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(question.id);
    },
    [onDelete, question.id]
  );

  const isLayout =
    question.type === 'welcome_screen' || question.type === 'end_screen';

  const displayNumber = isLayout ? null : index + 1;

  const truncatedTitle =
    question.title.length > 28
      ? question.title.slice(0, 28) + '...'
      : question.title || definition.label;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onClick={() => onSelect(question.id)}
      className={cn(
        'group relative flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2.5 text-sm transition-all duration-150',
        'hover:bg-gray-50 dark:hover:bg-gray-800/50',
        isSelected &&
          'border-l-2 border-l-indigo-600 bg-indigo-50/50 dark:border-l-indigo-400 dark:bg-indigo-950/20',
        !isSelected && 'border-l-2 border-l-transparent'
      )}
    >
      <div
        className="flex shrink-0 cursor-grab items-center text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-600"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
          isSelected
            ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
        )}
      >
        <IconComponent className="h-3.5 w-3.5" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1.5">
          {displayNumber !== null && (
            <span className="shrink-0 text-xs font-medium text-gray-400 dark:text-gray-500">
              {displayNumber}.
            </span>
          )}
          <span
            className={cn(
              'truncate text-sm',
              isSelected
                ? 'font-medium text-gray-900 dark:text-gray-100'
                : 'text-gray-700 dark:text-gray-300'
            )}
          >
            {truncatedTitle}
          </span>
          {question.required && (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500"
              title="Required"
            />
          )}
        </div>
      </div>

      <button
        onClick={handleDelete}
        className={cn(
          'shrink-0 rounded-md p-1 text-gray-400 opacity-0 transition-all duration-150',
          'hover:bg-red-50 hover:text-red-600',
          'dark:hover:bg-red-950 dark:hover:text-red-400',
          'group-hover:opacity-100',
          'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20'
        )}
        aria-label={`Delete question ${truncatedTitle}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
