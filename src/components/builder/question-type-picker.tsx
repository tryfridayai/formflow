'use client';

import React from 'react';
import {
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  QUESTION_TYPE_DEFINITIONS,
  QUESTION_TYPE_CATEGORIES,
} from '@/lib/utils/constants';
import type { QuestionType } from '@/lib/types/form';

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

interface QuestionTypePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: QuestionType) => void;
}

export function QuestionTypePicker({
  open,
  onClose,
  onSelect,
}: QuestionTypePickerProps) {
  const handleSelect = (type: QuestionType) => {
    onSelect(type);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a question</DialogTitle>
          <DialogDescription>
            Choose a question type to add to your form.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {QUESTION_TYPE_CATEGORIES.map((category) => (
            <div key={category.label}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {category.label}
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {category.types.map((type) => {
                  const definition = QUESTION_TYPE_DEFINITIONS[type];
                  const IconComponent = ICON_MAP[definition.icon] || Type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleSelect(type)}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border border-gray-200 p-3 text-left transition-all duration-150',
                        'hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm',
                        'dark:border-gray-800 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20'
                      )}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {definition.label}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {definition.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
