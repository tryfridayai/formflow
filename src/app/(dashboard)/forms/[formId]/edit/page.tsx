'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from '@/lib/hooks/use-form';
import { useQuestions } from '@/lib/hooks/use-questions';
import { useBuilderContext } from '@/lib/store/builder-context';
import { BuilderToolbar } from '@/components/builder/builder-toolbar';
import { QuestionList } from '@/components/builder/question-list';
import { QuestionEditor } from '@/components/builder/question-editor';
import type { Question, QuestionType } from '@/lib/types/form';

export default function EditPage() {
  const params = useParams();
  const formId = params.formId as string;
  const { form, loading, refresh } = useForm(formId);
  const { selectedQuestionId, setSelectedQuestion, setUnsavedChanges } =
    useBuilderContext();

  const {
    questions,
    addQuestion,
    editQuestion,
    removeQuestion,
    reorder,
    setQuestions,
  } = useQuestions({
    formId,
    initialQuestions: [],
    onUpdate: () => {
      setUnsavedChanges(false);
    },
  });

  // Sync questions from form data
  useEffect(() => {
    if (form?.questions) {
      setQuestions(form.questions);
    }
  }, [form?.questions, setQuestions]);

  // Auto-select first question if none selected
  useEffect(() => {
    if (!selectedQuestionId && questions.length > 0) {
      setSelectedQuestion(questions[0].id);
    }
  }, [questions, selectedQuestionId, setSelectedQuestion]);

  const handleAddQuestion = useCallback(
    async (type: QuestionType) => {
      const result = await addQuestion(type);
      if (result) {
        setSelectedQuestion(result.id);
      }
    },
    [addQuestion, setSelectedQuestion]
  );

  const handleDeleteQuestion = useCallback(
    async (id: string) => {
      await removeQuestion(id);
    },
    [removeQuestion]
  );

  const handleReorder = useCallback(
    async (orderedIds: string[]) => {
      await reorder(orderedIds);
    },
    [reorder]
  );

  const handleSaveQuestion = useCallback(
    async (questionId: string, data: Partial<Question>) => {
      await editQuestion(questionId, data);
    },
    [editQuestion]
  );

  const selectedQuestion = useMemo(() => {
    if (!selectedQuestionId) return null;
    return questions.find((q) => q.id === selectedQuestionId) || null;
  }, [questions, selectedQuestionId]);

  if (loading || !form) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <BuilderToolbar form={form} onRefresh={refresh} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: Question list (280px) */}
        <div className="w-[280px] shrink-0 border-r border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/30">
          <QuestionList
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onReorder={handleReorder}
          />
        </div>

        {/* Right panel: Question editor */}
        <div className="flex-1 overflow-hidden bg-white dark:bg-gray-950">
          <QuestionEditor
            question={selectedQuestion}
            onSave={handleSaveQuestion}
          />
        </div>
      </div>
    </div>
  );
}
