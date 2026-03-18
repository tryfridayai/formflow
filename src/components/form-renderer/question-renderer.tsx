'use client';

import { motion } from 'framer-motion';
import type { Question } from '@/lib/types/form';
import { useFormSubmission } from '@/lib/store/form-submission-context';
import { ShortTextField } from './question-types/short-text-field';
import { LongTextField } from './question-types/long-text-field';
import { EmailField } from './question-types/email-field';
import { NumberField } from './question-types/number-field';
import { PhoneField } from './question-types/phone-field';
import { MultipleChoiceField } from './question-types/multiple-choice-field';
import { DropdownField } from './question-types/dropdown-field';
import { RatingField } from './question-types/rating-field';
import { OpinionScaleField } from './question-types/opinion-scale-field';
import { DateField } from './question-types/date-field';
import { YesNoField } from './question-types/yes-no-field';
import { FileUploadField } from './question-types/file-upload-field';
import { UrlField } from './question-types/url-field';
import { WelcomeScreen } from './question-types/welcome-screen';
import { EndScreen } from './question-types/end-screen';

interface QuestionRendererProps {
  question: Question;
  questionNumber: number;
}

export function QuestionRenderer({
  question,
  questionNumber,
}: QuestionRendererProps) {
  const { form, state, setAnswer, goToNext } = useFormSubmission();
  const questionColor = form.theme?.question_color ?? '#ffffff';
  const answerColor = form.theme?.answer_color ?? '#4f46e5';
  const showNumbers = form.settings.show_question_numbers;

  const currentValue = state.answers[question.id];

  const handleChange = (value: string | string[]) => {
    setAnswer(question.id, value);
  };

  /* Welcome and End screens are standalone */
  if (question.type === 'welcome_screen') {
    return <WelcomeScreen question={question} />;
  }
  if (question.type === 'end_screen') {
    return <EndScreen question={question} />;
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      {/* Question header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          {showNumbers && (
            <motion.span
              className="mt-1 flex items-center gap-1 text-sm font-medium opacity-70"
              style={{ color: questionColor }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 0.7, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {questionNumber}
              <span className="text-xs">&#8594;</span>
            </motion.span>
          )}
          <div className="flex flex-col gap-2">
            <motion.h2
              className="text-xl font-bold leading-snug sm:text-2xl md:text-3xl"
              style={{ color: questionColor }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.4 }}
            >
              {question.title}
              {question.required && (
                <span className="ml-1 text-red-400">*</span>
              )}
            </motion.h2>
            {question.description && (
              <motion.p
                className="text-base opacity-60"
                style={{ color: questionColor }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.15 }}
              >
                {question.description}
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* Field */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <FieldSwitch
          question={question}
          value={currentValue}
          onChange={handleChange}
          onSubmit={goToNext}
          answerColor={answerColor}
          questionColor={questionColor}
        />
      </motion.div>
    </div>
  );
}

/* ----------------------------- Field switch ----------------------------- */

interface FieldSwitchProps {
  question: Question;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  onSubmit: () => void;
  answerColor: string;
  questionColor: string;
}

function FieldSwitch({
  question,
  value,
  onChange,
  onSubmit,
  answerColor,
  questionColor,
}: FieldSwitchProps) {
  const strValue = typeof value === 'string' ? value : '';
  const arrValue = Array.isArray(value) ? value : [];

  switch (question.type) {
    case 'short_text':
      return (
        <ShortTextField
          question={question}
          value={strValue}
          onChange={(v) => onChange(v)}
          onSubmit={onSubmit}
          answerColor={answerColor}
        />
      );
    case 'long_text':
      return (
        <LongTextField
          question={question}
          value={strValue}
          onChange={(v) => onChange(v)}
          onSubmit={onSubmit}
          answerColor={answerColor}
        />
      );
    case 'email':
      return (
        <EmailField
          question={question}
          value={strValue}
          onChange={(v) => onChange(v)}
          onSubmit={onSubmit}
          answerColor={answerColor}
        />
      );
    case 'number':
      return (
        <NumberField
          question={question}
          value={strValue}
          onChange={(v) => onChange(v)}
          onSubmit={onSubmit}
          answerColor={answerColor}
        />
      );
    case 'phone':
      return (
        <PhoneField
          question={question}
          value={strValue}
          onChange={(v) => onChange(v)}
          onSubmit={onSubmit}
          answerColor={answerColor}
        />
      );
    case 'multiple_choice':
      return (
        <MultipleChoiceField
          question={question}
          value={arrValue}
          onChange={(v) => onChange(v)}
          onSubmit={onSubmit}
          answerColor={answerColor}
          questionColor={questionColor}
        />
      );
    case 'dropdown':
      return (
        <DropdownField
          question={question}
          value={strValue}
          onChange={(v) => onChange(v)}
          onSubmit={onSubmit}
          answerColor={answerColor}
        />
      );
    case 'rating':
      return (
        <RatingField
          question={question}
          value={strValue}
          onChange={(v) => onChange(v)}
          onSubmit={onSubmit}
          answerColor={answerColor}
        />
      );
    case 'opinion_scale':
      return (
        <OpinionScaleField
          question={question}
          value={strValue}
          onChange={(v) => onChange(v)}
          onSubmit={onSubmit}
          answerColor={answerColor}
          questionColor={questionColor}
        />
      );
    case 'date':
      return (
        <DateField
          question={question}
          value={strValue}
          onChange={(v) => onChange(v)}
          onSubmit={onSubmit}
          answerColor={answerColor}
        />
      );
    case 'yes_no':
      return (
        <YesNoField
          question={question}
          value={strValue}
          onChange={(v) => onChange(v)}
          onSubmit={onSubmit}
          answerColor={answerColor}
          questionColor={questionColor}
        />
      );
    case 'file_upload':
      return (
        <FileUploadField
          question={question}
          value={strValue}
          onChange={(v) => onChange(v)}
          answerColor={answerColor}
          questionColor={questionColor}
        />
      );
    case 'url':
      return (
        <UrlField
          question={question}
          value={strValue}
          onChange={(v) => onChange(v)}
          onSubmit={onSubmit}
          answerColor={answerColor}
        />
      );
    default:
      return null;
  }
}
