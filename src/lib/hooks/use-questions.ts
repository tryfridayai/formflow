'use client';

import { useCallback, useState } from 'react';
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
} from '@/lib/actions/questions';
import type { Question, QuestionType } from '@/lib/types/form';

interface UseQuestionsOptions {
  formId: string;
  initialQuestions?: Question[];
  onUpdate?: () => void;
}

export function useQuestions({
  formId,
  initialQuestions = [],
  onUpdate,
}: UseQuestionsOptions) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with external data
  const setExternalQuestions = useCallback((newQuestions: Question[]) => {
    setQuestions(newQuestions);
  }, []);

  const addQuestion = useCallback(
    async (type: QuestionType, orderIndex?: number) => {
      setLoading(true);
      setError(null);

      const insertIndex = orderIndex ?? questions.length;

      // Optimistic update: insert a placeholder
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticQuestion: Question = {
        id: optimisticId,
        form_id: formId,
        type,
        title: '',
        required: type !== 'welcome_screen' && type !== 'end_screen',
        order_index: insertIndex,
        properties: { type, config: {} } as Question['properties'],
        logic_rules: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setQuestions((prev) => {
        const updated = prev.map((q) =>
          q.order_index >= insertIndex
            ? { ...q, order_index: q.order_index + 1 }
            : q
        );
        return [...updated, optimisticQuestion].sort(
          (a, b) => a.order_index - b.order_index
        );
      });

      try {
        const result = await createQuestion(formId, type, insertIndex);

        if (result.error) {
          // Revert optimistic update
          setQuestions((prev) =>
            prev
              .filter((q) => q.id !== optimisticId)
              .map((q) =>
                q.order_index > insertIndex
                  ? { ...q, order_index: q.order_index - 1 }
                  : q
              )
          );
          setError(result.error);
          return null;
        }

        // Replace optimistic with real data
        setQuestions((prev) =>
          prev
            .map((q) =>
              q.id === optimisticId
                ? { ...(result.data as Question), logic_rules: [] }
                : q
            )
            .sort((a, b) => a.order_index - b.order_index)
        );

        onUpdate?.();
        return result.data;
      } catch (err) {
        // Revert optimistic update
        setQuestions((prev) =>
          prev
            .filter((q) => q.id !== optimisticId)
            .map((q) =>
              q.order_index > insertIndex
                ? { ...q, order_index: q.order_index - 1 }
                : q
            )
        );
        setError(err instanceof Error ? err.message : 'Failed to create question');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [formId, questions.length, onUpdate]
  );

  const editQuestion = useCallback(
    async (questionId: string, data: Partial<Question>) => {
      setError(null);

      // Optimistic update
      const previousQuestions = [...questions];
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, ...data, updated_at: new Date().toISOString() } : q
        )
      );

      try {
        const result = await updateQuestion(questionId, data);

        if (result.error) {
          // Revert
          setQuestions(previousQuestions);
          setError(result.error);
          return false;
        }

        // Update with server response
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId
              ? { ...q, ...(result.data as Question) }
              : q
          )
        );

        onUpdate?.();
        return true;
      } catch (err) {
        setQuestions(previousQuestions);
        setError(err instanceof Error ? err.message : 'Failed to update question');
        return false;
      }
    },
    [questions, onUpdate]
  );

  const removeQuestion = useCallback(
    async (questionId: string) => {
      setLoading(true);
      setError(null);

      // Optimistic update
      const previousQuestions = [...questions];
      const removedQuestion = questions.find((q) => q.id === questionId);

      if (!removedQuestion) {
        setLoading(false);
        return false;
      }

      setQuestions((prev) =>
        prev
          .filter((q) => q.id !== questionId)
          .map((q) =>
            q.order_index > removedQuestion.order_index
              ? { ...q, order_index: q.order_index - 1 }
              : q
          )
      );

      try {
        const result = await deleteQuestion(questionId);

        if (result.error) {
          setQuestions(previousQuestions);
          setError(result.error);
          return false;
        }

        onUpdate?.();
        return true;
      } catch (err) {
        setQuestions(previousQuestions);
        setError(err instanceof Error ? err.message : 'Failed to delete question');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [questions, onUpdate]
  );

  const reorder = useCallback(
    async (orderedIds: string[]) => {
      setError(null);

      // Optimistic update
      const previousQuestions = [...questions];
      setQuestions((prev) => {
        const questionMap = new Map(prev.map((q) => [q.id, q]));
        return orderedIds
          .map((id, index) => {
            const q = questionMap.get(id);
            return q ? { ...q, order_index: index } : null;
          })
          .filter((q): q is Question => q !== null);
      });

      try {
        const result = await reorderQuestions(formId, orderedIds);

        if (result.error) {
          setQuestions(previousQuestions);
          setError(result.error);
          return false;
        }

        onUpdate?.();
        return true;
      } catch (err) {
        setQuestions(previousQuestions);
        setError(err instanceof Error ? err.message : 'Failed to reorder questions');
        return false;
      }
    },
    [formId, questions, onUpdate]
  );

  return {
    questions,
    loading,
    error,
    addQuestion,
    editQuestion,
    removeQuestion,
    reorder,
    setQuestions: setExternalQuestions,
  };
}
