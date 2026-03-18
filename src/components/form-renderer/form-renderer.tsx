'use client';

import { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FormSubmissionProvider,
  useFormSubmission,
} from '@/lib/store/form-submission-context';
import { useKeyboardNavigation } from '@/lib/hooks/use-keyboard-navigation';
import type { Form } from '@/lib/types/form';
import { normalizeTheme } from '@/lib/utils/theme';
import { ProgressBar } from './progress-bar';
import { NavigationControls } from './navigation-controls';
import { QuestionRenderer } from './question-renderer';
import { FormComplete } from './form-complete';

/* =====================================================================
   Public API — wraps everything in the submission provider
   ===================================================================== */

interface FormRendererProps {
  form: Form;
}

export function FormRenderer({ form }: FormRendererProps) {
  return (
    <FormSubmissionProvider form={form}>
      <FormRendererInner />
    </FormSubmissionProvider>
  );
}

/* =====================================================================
   Inner renderer — consumes the context
   ===================================================================== */

function FormRendererInner() {
  const {
    form,
    state,
    sortedQuestions,
    currentQuestion,
    goToNext,
    goToPrevious,
    submit,
    isLastQuestion,
  } = useFormSubmission();

  /* ------------- Theme ------------- */
  const theme = normalizeTheme(form.theme);
  const bgColor = theme.backgroundColor;
  const bgImage = theme.backgroundImage;
  const fontFamily = theme.fontFamily;

  /* ------------- Question numbering (skip welcome/end screens) ------------- */
  const questionNumberMap = useMemo(() => {
    const map: Record<string, number> = {};
    let num = 0;
    for (const q of sortedQuestions) {
      if (q.type !== 'welcome_screen' && q.type !== 'end_screen') {
        num++;
        map[q.id] = num;
      }
    }
    return map;
  }, [sortedQuestions]);

  /* ------------- Keyboard navigation ------------- */
  const handleSubmit = useCallback(() => {
    if (isLastQuestion) {
      submit();
    }
  }, [isLastQuestion, submit]);

  useKeyboardNavigation({
    totalQuestions: sortedQuestions.length,
    currentIndex: state.currentQuestionIndex,
    onNext: goToNext,
    onPrevious: goToPrevious,
    onSubmit: handleSubmit,
    enabled: !state.isComplete && !state.isSubmitting,
  });

  /* ------------- Slide transition variants ------------- */
  const slideVariants = {
    enter: (direction: number) => ({
      y: direction > 0 ? 60 : -60,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      y: direction > 0 ? -60 : 60,
      opacity: 0,
      scale: 0.98,
    }),
  };

  /* ------------- Completion screen ------------- */
  if (state.isComplete) {
    return <FormComplete />;
  }

  if (!currentQuestion) return null;

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{ fontFamily }}
    >
      {/* Background layer */}
      <div
        className="fixed inset-0 -z-10"
        style={{ backgroundColor: bgColor }}
      >
        {bgImage && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${bgImage})`,
              opacity: 1,
            }}
          />
        )}
      </div>

      {/* Progress bar */}
      <ProgressBar />

      {/* Error banner */}
      {state.error && (
        <motion.div
          className="fixed left-0 right-0 top-2 z-50 mx-auto max-w-md rounded-lg bg-red-500/90 px-4 py-2 text-center text-sm text-white shadow-lg backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {state.error}
        </motion.div>
      )}

      {/* Question area */}
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={currentQuestion.id}
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="flex w-full items-center justify-center"
          >
            <QuestionRenderer
              question={currentQuestion}
              questionNumber={questionNumberMap[currentQuestion.id] ?? 0}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation controls */}
      <NavigationControls />
    </div>
  );
}
