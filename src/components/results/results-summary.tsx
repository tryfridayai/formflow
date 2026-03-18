'use client';

import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AnalyticsData {
  totalResponses: number;
  completionRate: number;
  avgDurationSeconds: number;
  responsesOverTime: Array<{ date: string; count: number }>;
}

interface ResultsSummaryProps {
  analytics: AnalyticsData | null;
  loading: boolean;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

export function ResultsSummary({ analytics, loading }: ResultsSummaryProps) {
  const today = new Date().toISOString().slice(0, 10);
  const responsesToday =
    analytics?.responsesOverTime.find((r) => r.date === today)?.count ?? 0;

  const cards = [
    {
      label: 'Total Responses',
      value: analytics?.totalResponses ?? 0,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Completion Rate',
      value: `${analytics?.completionRate ?? 0}%`,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Avg. Time',
      value: formatDuration(analytics?.avgDurationSeconds ?? 0),
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Responses Today',
      value: responsesToday,
      icon: TrendingUp,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {card.label}
            </p>
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg',
                card.bgColor
              )}
            >
              <card.icon className={cn('h-4 w-4', card.color)} />
            </div>
          </div>
          <div className="mt-2">
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {card.value}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
