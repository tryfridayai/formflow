'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { QuestionType } from '@/lib/types/form';

interface QuestionBreakdown {
  questionId: string;
  title: string;
  type: QuestionType;
  answerCount: number;
  responseRate: number;
}

interface CompletionFunnelProps {
  questionBreakdowns: QuestionBreakdown[];
  totalResponses: number;
  loading: boolean;
}

export function CompletionFunnel({
  questionBreakdowns,
  totalResponses,
  loading,
}: CompletionFunnelProps) {
  const funnelData = useMemo(() => {
    if (!questionBreakdowns.length || totalResponses === 0) return [];

    return questionBreakdowns.map((q, index) => ({
      title: q.title,
      count: q.answerCount,
      percentage: Math.round((q.answerCount / totalResponses) * 100),
      dropOff:
        index === 0
          ? 0
          : Math.max(
              0,
              questionBreakdowns[index - 1].answerCount - q.answerCount
            ),
    }));
  }, [questionBreakdowns, totalResponses]);

  const maxCount = totalResponses;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (funnelData.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
          Completion Funnel
        </h3>
        <p className="text-xs text-gray-400">No data available yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Completion Funnel
        </h3>
        <span className="text-xs text-gray-400">
          {totalResponses} total starts
        </span>
      </div>
      <p className="mb-6 text-xs text-gray-500 dark:text-gray-400">
        See where respondents drop off in your form
      </p>

      <div className="flex flex-col gap-3">
        {funnelData.map((item, index) => {
          const widthPercent =
            maxCount > 0 ? Math.max(5, (item.count / maxCount) * 100) : 5;

          return (
            <div key={item.title} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="max-w-[60%] truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                  {index + 1}. {item.title}
                </span>
                <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {item.count}
                  </span>
                  <span>({item.percentage}%)</span>
                  {item.dropOff > 0 && (
                    <span className="text-red-500">
                      -{item.dropOff}
                    </span>
                  )}
                </span>
              </div>
              <div className="h-6 w-full overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                <motion.div
                  className="h-full rounded-md"
                  style={{
                    background: `linear-gradient(90deg, #6366f1 0%, ${
                      item.percentage > 50 ? '#6366f1' : '#f43f5e'
                    } 100%)`,
                  }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${widthPercent}%` }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.08,
                    ease: 'easeOut',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
