'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuestionListItem } from './question-list-item';
import { QuestionTypePicker } from './question-type-picker';
import { useBuilderContext } from '@/lib/store/builder-context';
import type { Question, QuestionType } from '@/lib/types/form';

interface QuestionListProps {
  questions: Question[];
  onAddQuestion: (type: QuestionType) => void;
  onDeleteQuestion: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
}

export function QuestionList({
  questions,
  onAddQuestion,
  onDeleteQuestion,
  onReorder,
}: QuestionListProps) {
  const { selectedQuestionId, setSelectedQuestion } = useBuilderContext();
  const [pickerOpen, setPickerOpen] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = useCallback(
    (_e: React.DragEvent, index: number) => {
      dragItem.current = index;
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      dragOverItem.current = index;
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (dragItem.current === null || dragOverItem.current === null) return;
      if (dragItem.current === dragOverItem.current) return;

      const reordered = [...questions];
      const [removed] = reordered.splice(dragItem.current, 1);
      reordered.splice(dragOverItem.current, 0, removed);

      const orderedIds = reordered.map((q) => q.id);
      onReorder(orderedIds);

      dragItem.current = null;
      dragOverItem.current = null;
    },
    [questions, onReorder]
  );

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedQuestion(id);
    },
    [setSelectedQuestion]
  );

  const handleDelete = useCallback(
    (id: string) => {
      onDeleteQuestion(id);
      if (selectedQuestionId === id) {
        const remaining = questions.filter((q) => q.id !== id);
        setSelectedQuestion(remaining.length > 0 ? remaining[0].id : null);
      }
    },
    [onDeleteQuestion, selectedQuestionId, questions, setSelectedQuestion]
  );

  const handleAddQuestion = useCallback(
    (type: QuestionType) => {
      onAddQuestion(type);
    },
    [onAddQuestion]
  );

  // Compute display numbers (exclude welcome/end screens from numbering)
  let questionNumber = 0;
  const numberedQuestions = questions.map((q) => {
    const isLayout =
      q.type === 'welcome_screen' || q.type === 'end_screen';
    if (!isLayout) {
      questionNumber++;
    }
    return { question: q, displayIndex: isLayout ? -1 : questionNumber - 1 };
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Questions
        </h2>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {questions.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {numberedQuestions.map(({ question, displayIndex }) => (
          <QuestionListItem
            key={question.id}
            question={question}
            index={displayIndex}
            isSelected={selectedQuestionId === question.id}
            onSelect={handleSelect}
            onDelete={handleDelete}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>

      <div className="border-t border-gray-200 p-3 dark:border-gray-800">
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => setPickerOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add question
        </Button>
      </div>

      <QuestionTypePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAddQuestion}
      />
    </div>
  );
}
