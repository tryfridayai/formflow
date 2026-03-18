'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import type { Question, EndScreenProperties } from '@/lib/types/form';
import { useFormSubmission } from '@/lib/store/form-submission-context';
import { normalizeTheme } from '@/lib/utils/theme';

interface EndScreenProps {
  question: Question;
}

export function EndScreen({ question }: EndScreenProps) {
  const { form } = useFormSubmission();
  const config = question.properties.config as EndScreenProperties;
  const theme = normalizeTheme(form.theme);
  const questionColor = theme.textColor;
  const primaryColor = theme.primaryColor;
  const buttonTextColor = '#ffffff';

  // Handle redirect
  useEffect(() => {
    if (config?.redirect_url) {
      const delay = (config.redirect_delay ?? 3) * 1000;
      const timer = setTimeout(() => {
        window.location.href = config.redirect_url!;
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [config?.redirect_url, config?.redirect_delay]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 text-center">
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          duration: 0.8,
        }}
      >
        <CheckCircle2
          className="h-20 w-20 sm:h-24 sm:w-24"
          style={{ color: primaryColor }}
          strokeWidth={1.5}
        />
      </motion.div>

      <motion.h1
        className="max-w-xl text-3xl font-bold leading-tight sm:text-4xl"
        style={{ color: questionColor }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {question.title}
      </motion.h1>

      {(config?.description || question.description) && (
        <motion.p
          className="max-w-md text-base opacity-60 sm:text-lg"
          style={{ color: questionColor }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          {config?.description ?? question.description}
        </motion.p>
      )}

      {config?.show_button && config?.button_url && (
        <motion.a
          href={config.button_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-2 rounded-xl px-8 py-3 text-base font-bold shadow-xl transition-shadow hover:shadow-2xl"
          style={{
            backgroundColor: primaryColor,
            color: buttonTextColor,
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          {config.button_text ?? 'Continue'}
          <ExternalLink className="h-4 w-4" />
        </motion.a>
      )}

      {config?.redirect_url && (
        <motion.p
          className="text-xs opacity-30"
          style={{ color: questionColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.8 }}
        >
          Redirecting in {config.redirect_delay ?? 3} seconds...
        </motion.p>
      )}
    </div>
  );
}
