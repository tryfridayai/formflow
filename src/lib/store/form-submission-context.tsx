'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import type { Form, Question } from '@/lib/types/form';
import { getNextQuestionId, calculateProgress } from '@/lib/utils/logic-engine';
import { submitResponse } from '@/lib/actions/responses';

/* -------------------------------- Types -------------------------------- */

interface FormSubmissionState {
  answers: Record<string, string | string[]>;
  currentQuestionIndex: number;
  navigationHistory: string[];
  isSubmitting: boolean;
  isComplete: boolean;
  error: string | null;
}

type FormSubmissionAction =
  | { type: 'SET_ANSWER'; questionId: string; value: string | string[] }
  | { type: 'GO_TO_NEXT'; nextQuestionId: string; nextIndex: number }
  | { type: 'GO_TO_PREVIOUS'; prevIndex: number }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; error: string }
  | { type: 'RESET' };

interface FormSubmissionContextValue {
  state: FormSubmissionState;
  form: Form;
  sortedQuestions: Question[];
  currentQuestion: Question | null;
  progress: number;
  setAnswer: (questionId: string, value: string | string[]) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  submit: () => Promise<void>;
  canGoBack: boolean;
  isLastQuestion: boolean;
}

/* ------------------------------ Reducer ------------------------------ */

function formSubmissionReducer(
  state: FormSubmissionState,
  action: FormSubmissionAction
): FormSubmissionState {
  switch (action.type) {
    case 'SET_ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.value },
      };

    case 'GO_TO_NEXT':
      return {
        ...state,
        currentQuestionIndex: action.nextIndex,
        navigationHistory: [
          ...state.navigationHistory,
          action.nextQuestionId,
        ],
      };

    case 'GO_TO_PREVIOUS':
      return {
        ...state,
        currentQuestionIndex: action.prevIndex,
        navigationHistory: state.navigationHistory.slice(0, -1),
      };

    case 'SUBMIT_START':
      return { ...state, isSubmitting: true, error: null };

    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitting: false, isComplete: true };

    case 'SUBMIT_ERROR':
      return { ...state, isSubmitting: false, error: action.error };

    case 'RESET':
      return createInitialState();

    default:
      return state;
  }
}

function createInitialState(): FormSubmissionState {
  return {
    answers: {},
    currentQuestionIndex: 0,
    navigationHistory: [],
    isSubmitting: false,
    isComplete: false,
    error: null,
  };
}

/* ------------------------------ Context ------------------------------ */

const FormSubmissionContext = createContext<FormSubmissionContextValue | null>(
  null
);

export function useFormSubmission() {
  const ctx = useContext(FormSubmissionContext);
  if (!ctx) {
    throw new Error(
      'useFormSubmission must be used within a FormSubmissionProvider'
    );
  }
  return ctx;
}

/* ----------------------------- Provider ------------------------------ */

interface FormSubmissionProviderProps {
  form: Form;
  children: React.ReactNode;
}

export function FormSubmissionProvider({
  form,
  children,
}: FormSubmissionProviderProps) {
  const [state, dispatch] = useReducer(
    formSubmissionReducer,
    createInitialState()
  );

  const startedAt = useRef(new Date().toISOString());

  const sortedQuestions = useMemo(
    () => [...form.questions].sort((a, b) => a.order_index - b.order_index),
    [form.questions]
  );

  const currentQuestion = sortedQuestions[state.currentQuestionIndex] ?? null;

  const progress = currentQuestion
    ? calculateProgress(sortedQuestions, currentQuestion.id)
    : 0;

  const canGoBack =
    state.currentQuestionIndex > 0 && state.navigationHistory.length > 0;

  /* Determine if the current question is the last answerable one */
  const isLastQuestion = useMemo(() => {
    if (!currentQuestion) return false;
    // If this is an end_screen, it's the last
    if (currentQuestion.type === 'end_screen') return true;
    // Check if logic would yield a next question
    const nextId = getNextQuestionId(
      sortedQuestions,
      currentQuestion.id,
      state.answers
    );
    if (!nextId) return true;
    // If the next is an end_screen, the current is the last answerable
    const nextQ = sortedQuestions.find((q) => q.id === nextId);
    return nextQ?.type === 'end_screen';
  }, [currentQuestion, sortedQuestions, state.answers]);

  const setAnswer = useCallback(
    (questionId: string, value: string | string[]) => {
      dispatch({ type: 'SET_ANSWER', questionId, value });
    },
    []
  );

  const goToNext = useCallback(() => {
    if (!currentQuestion) return;

    const nextId = getNextQuestionId(
      sortedQuestions,
      currentQuestion.id,
      state.answers
    );

    if (!nextId) return;

    const nextIndex = sortedQuestions.findIndex((q) => q.id === nextId);
    if (nextIndex === -1) return;

    dispatch({
      type: 'GO_TO_NEXT',
      nextQuestionId: currentQuestion.id,
      nextIndex,
    });
  }, [currentQuestion, sortedQuestions, state.answers]);

  const goToPrevious = useCallback(() => {
    if (!canGoBack) return;

    const prevQuestionId =
      state.navigationHistory[state.navigationHistory.length - 1];
    const prevIndex = sortedQuestions.findIndex(
      (q) => q.id === prevQuestionId
    );

    if (prevIndex === -1) return;

    dispatch({ type: 'GO_TO_PREVIOUS', prevIndex });
  }, [canGoBack, state.navigationHistory, sortedQuestions]);

  const submit = useCallback(async () => {
    dispatch({ type: 'SUBMIT_START' });

    try {
      const result = await submitResponse(form.id, state.answers, {
        started_at: startedAt.current,
        user_agent:
          typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        referrer:
          typeof document !== 'undefined' ? document.referrer : undefined,
      });

      if (result.error) {
        dispatch({ type: 'SUBMIT_ERROR', error: result.error });
      } else {
        dispatch({ type: 'SUBMIT_SUCCESS' });
      }
    } catch (err) {
      dispatch({
        type: 'SUBMIT_ERROR',
        error:
          err instanceof Error ? err.message : 'An unexpected error occurred.',
      });
    }
  }, [form.id, state.answers]);

  const value = useMemo<FormSubmissionContextValue>(
    () => ({
      state,
      form,
      sortedQuestions,
      currentQuestion,
      progress,
      setAnswer,
      goToNext,
      goToPrevious,
      submit,
      canGoBack,
      isLastQuestion,
    }),
    [
      state,
      form,
      sortedQuestions,
      currentQuestion,
      progress,
      setAnswer,
      goToNext,
      goToPrevious,
      submit,
      canGoBack,
      isLastQuestion,
    ]
  );

  return (
    <FormSubmissionContext.Provider value={value}>
      {children}
    </FormSubmissionContext.Provider>
  );
}
