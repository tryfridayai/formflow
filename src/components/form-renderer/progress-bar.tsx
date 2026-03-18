'use client';

import { motion } from 'framer-motion';
import { useFormSubmission } from '@/lib/store/form-submission-context';

export function ProgressBar() {
  const { progress, form } = useFormSubmission();
  const primaryColor = form.theme?.button_color ?? '#4f46e5';

  if (!form.settings.show_progress_bar) return null;

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
