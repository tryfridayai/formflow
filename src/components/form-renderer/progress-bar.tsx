'use client';

import { motion } from 'framer-motion';
import { useFormSubmission } from '@/lib/store/form-submission-context';
import { normalizeTheme } from '@/lib/utils/theme';

export function ProgressBar() {
  const { progress, form } = useFormSubmission();
  const theme = normalizeTheme(form.theme);
  const primaryColor = theme.primaryColor;

  const formRecord = form as unknown as Record<string, unknown>;
  if (formRecord.show_progress_bar === false) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-black/5">
      <motion.div
        className="h-full"
        style={{ backgroundColor: primaryColor }}
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Form progress: ${progress}%`}
      />
    </div>
  );
}
