'use client';

import { useCallback, useEffect } from 'react';

interface UseKeyboardNavigationOptions {
  /** Total number of questions (including welcome/end screens) */
  totalQuestions: number;
  /** Current question index (0-based) */
  currentIndex: number;
  /** Callback to go to the next question */
  onNext: () => void;
  /** Callback to go to the previous question */
  onPrevious: () => void;
  /** Callback when a number key is pressed (for multiple choice selection) */
  onChoiceSelect?: (choiceIndex: number) => void;
  /** Callback when the form is submitted (Enter on last question) */
  onSubmit?: () => void;
  /** Whether keyboard navigation is enabled */
  enabled?: boolean;
}

/**
 * Hook for keyboard navigation in the form renderer.
 *
 * - Enter / ArrowDown: advance to next question
 * - Shift+Tab / ArrowUp: go back to previous question
 * - Number keys (1-9): select a choice option
 * - Y / N: select yes/no
 * - Tab: advance to next question (when not in a text input)
 */
export function useKeyboardNavigation({
  totalQuestions,
  currentIndex,
  onNext,
  onPrevious,
  onChoiceSelect,
  onSubmit,
  enabled = true,
}: UseKeyboardNavigationOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isTextInput =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target.isContentEditable;

      switch (event.key) {
        case 'Enter': {
          // Don't intercept Enter in textarea (allow newlines)
          if (tagName === 'textarea' && !event.metaKey && !event.ctrlKey) {
            return;
          }

          event.preventDefault();

          if (currentIndex >= totalQuestions - 1) {
            onSubmit?.();
          } else {
            onNext();
          }
          break;
        }

        case 'ArrowDown': {
          // Don't intercept in text inputs or selects
          if (isTextInput) return;

          event.preventDefault();
          if (currentIndex < totalQuestions - 1) {
            onNext();
          }
          break;
        }

        case 'ArrowUp': {
          // Don't intercept in text inputs or selects
          if (isTextInput) return;

          event.preventDefault();
          if (currentIndex > 0) {
            onPrevious();
          }
          break;
        }

        case 'Tab': {
          if (event.shiftKey) {
            // Shift+Tab: go back
            event.preventDefault();
            if (currentIndex > 0) {
              onPrevious();
            }
          } else if (!isTextInput) {
            // Tab (when not in text input): go forward
            event.preventDefault();
            if (currentIndex < totalQuestions - 1) {
              onNext();
            }
          }
          break;
        }

        default: {
          // Number keys 1-9 for choice selection
          if (
            onChoiceSelect &&
            event.key >= '1' &&
            event.key <= '9' &&
            !isTextInput &&
            !event.metaKey &&
            !event.ctrlKey &&
            !event.altKey
          ) {
            event.preventDefault();
            const choiceIndex = parseInt(event.key, 10) - 1;
            onChoiceSelect(choiceIndex);
          }

          // Y/N for yes/no questions
          if (
            onChoiceSelect &&
            !isTextInput &&
            !event.metaKey &&
            !event.ctrlKey &&
            !event.altKey
          ) {
            const lowerKey = event.key.toLowerCase();
            if (lowerKey === 'y') {
              event.preventDefault();
              onChoiceSelect(0); // Yes is first option
            } else if (lowerKey === 'n') {
              event.preventDefault();
              onChoiceSelect(1); // No is second option
            }
          }
          break;
        }
      }
    },
    [
      enabled,
      currentIndex,
      totalQuestions,
      onNext,
      onPrevious,
      onChoiceSelect,
      onSubmit,
    ]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}
