'use client';

import { motion } from 'framer-motion';
import type { Question, WelcomeScreenProperties } from '@/lib/types/form';
import { useFormSubmission } from '@/lib/store/form-submission-context';
import { normalizeTheme } from '@/lib/utils/theme';

interface WelcomeScreenProps {
  question: Question;
}

export function WelcomeScreen({ question }: WelcomeScreenProps) {
  const { goToNext, form } = useFormSubmission();
  const config = question.properties.config as WelcomeScreenProperties;
  const theme = normalizeTheme(form.theme);
  const questionColor = theme.textColor;
  const primaryColor = theme.primaryColor;
  const buttonTextColor = '#ffffff';

  return (
    <div className="flex flex-col items-center justify-center gap-8 text-center">
      {config?.image_url && (
        <motion.img
          src={config.image_url}
          alt=""
          className="h-32 w-32 rounded-2xl object-cover"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      <motion.h1
        className="max-w-xl text-3xl font-bold leading-tight sm:text-4xl md:text-5xl"
        style={{ color: questionColor }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {question.title}
      </motion.h1>

      {(config?.description || question.description) && (
        <motion.p
          className="max-w-md text-base opacity-60 sm:text-lg"
          style={{ color: questionColor }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          {config?.description ?? question.description}
        </motion.p>
      )}

      {config?.show_button !== false && (
        <motion.button
          type="button"
          onClick={goToNext}
          className="mt-4 rounded-xl px-10 py-4 text-lg font-bold shadow-xl transition-shadow hover:shadow-2xl"
          style={{
            backgroundColor: primaryColor,
            color: buttonTextColor,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          {config?.button_text ?? 'Start'}
        </motion.button>
      )}
    </div>
  );
}
