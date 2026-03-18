'use client';

import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useFormSubmission } from '@/lib/store/form-submission-context';
import { normalizeTheme } from '@/lib/utils/theme';

export function NavigationControls() {
  const {
    goToNext,
    goToPrevious,
    submit,
    canGoBack,
    isLastQuestion,
    state,
    currentQuestion,
    form,
  } = useFormSubmission();

  const theme = normalizeTheme(form.theme);
  const primaryColor = theme.primaryColor;
  const buttonTextColor = '#ffffff';

  // Don't show controls on welcome or end screens
  if (
    currentQuestion?.type === 'welcome_screen' ||
    currentQuestion?.type === 'end_screen'
  ) {
    return null;
  }

  const handleOk = () => {
    if (isLastQuestion) {
      submit();
    } else {
      goToNext();
    }
  };

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 pb-8 pt-4">
        {/* Previous / Next arrows */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToPrevious}
            disabled={!canGoBack}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-md border border-white/20 transition-all',
              canGoBack
                ? 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white backdrop-blur-sm'
                : 'cursor-not-allowed bg-white/5 text-white/20'
            )}
            aria-label="Previous question"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            disabled={isLastQuestion}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-md border border-white/20 transition-all',
              !isLastQuestion
                ? 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white backdrop-blur-sm'
                : 'cursor-not-allowed bg-white/5 text-white/20'
            )}
            aria-label="Next question"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* OK / Submit button */}
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={handleOk}
            disabled={state.isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
            style={{
              backgroundColor: primaryColor,
              color: buttonTextColor,
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {state.isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Submitting...
              </>
            ) : isLastQuestion ? (
              <>
                <Check className="h-4 w-4" />
                Submit
              </>
            ) : (
              'OK'
            )}
          </motion.button>
          <span className="hidden text-xs text-white/40 sm:inline-flex items-center gap-1">
            press <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
