'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, PartyPopper } from 'lucide-react';
import { useFormSubmission } from '@/lib/store/form-submission-context';
import { normalizeTheme } from '@/lib/utils/theme';

export function FormComplete() {
  const { form } = useFormSubmission();
  const theme = normalizeTheme(form.theme);
  const questionColor = theme.textColor;
  const primaryColor = theme.primaryColor;
  const bgColor = theme.backgroundColor;

  const formRecord = form as unknown as Record<string, unknown>;
  const redirectUrl = (formRecord.redirect_url as string) || null;
  const [countdown, setCountdown] = useState(redirectUrl ? 5 : null);

  useEffect(() => {
    if (!redirectUrl) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          window.location.href = redirectUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [redirectUrl]);

  // Find end_screen question for custom messaging
  const endScreen = form.questions.find((q) => q.type === 'end_screen');

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex flex-col items-center gap-8 text-center">
        {/* Confetti-style animated icons */}
        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 12,
              delay: 0.1,
            }}
          >
            <CheckCircle2
              className="h-24 w-24"
              style={{ color: primaryColor }}
              strokeWidth={1.5}
            />
          </motion.div>

          {/* Decorative particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: '50%',
                left: '50%',
              }}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{
                x: Math.cos((i / 6) * Math.PI * 2) * 60,
                y: Math.sin((i / 6) * Math.PI * 2) * 60,
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 1,
                delay: 0.3 + i * 0.05,
                ease: 'easeOut',
              }}
            >
              <PartyPopper
                className="h-4 w-4"
                style={{ color: primaryColor }}
              />
            </motion.div>
          ))}
        </div>

        <motion.h1
          className="max-w-lg text-3xl font-bold sm:text-4xl"
          style={{ color: questionColor }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {endScreen?.title ?? 'Thank you!'}
        </motion.h1>

        <motion.p
          className="max-w-sm text-base opacity-60 sm:text-lg"
          style={{ color: questionColor }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          {endScreen?.description ??
            'Your response has been recorded. We appreciate your time.'}
        </motion.p>

        {redirectUrl && countdown !== null && (
          <motion.p
            className="text-sm opacity-30"
            style={{ color: questionColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 0.7 }}
          >
            Redirecting in {countdown}s...
          </motion.p>
        )}

        {/* FormFlow branding */}
        <motion.div
          className="mt-8 text-xs opacity-20"
          style={{ color: questionColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ delay: 1 }}
        >
          Powered by FormFlow
        </motion.div>
      </div>
    </div>
  );
}
