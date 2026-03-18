'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { QuestionType } from '@/lib/types/form';

interface QuestionBreakdown {
  questionId: string;
  title: string;
  type: QuestionType;
  answerCount: number;
  responseRate: number;
  distribution?: Record<string, number>;
}

interface QuestionSummaryProps {
  breakdown: QuestionBreakdown;
}

const COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
];

function isDistributionType(type: QuestionType): boolean {
  return [
    'multiple_choice',
    'dropdown',
    'yes_no',
    'rating',
    'opinion_scale',
  ].includes(type);
}

export function QuestionSummaryChart({ breakdown }: QuestionSummaryProps) {
  const chartData = useMemo(() => {
    if (!breakdown.distribution) return [];
    return Object.entries(breakdown.distribution)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [breakdown.distribution]);

  const hasDistribution = isDistributionType(breakdown.type) && chartData.length > 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-1 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[70%]">
          {breakdown.title}
        </h4>
        <span className="text-xs text-gray-400">
          {breakdown.answerCount} answers ({breakdown.responseRate}%)
        </span>
      </div>

      {hasDistribution ? (
        <div className="mt-4">
          {chartData.length <= 6 ? (
            /* Bar chart for small number of items */
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 0, right: 10, bottom: 0, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#f3f4f6',
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#6366f1"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            /* Pie chart for many items */
            <div className="flex items-center gap-4">
              <div className="h-40 w-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      innerRadius={30}
                      strokeWidth={0}
                    >
                      {chartData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#f3f4f6',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1 overflow-hidden">
                {chartData.slice(0, 8).map((item, index) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                    <span className="truncate text-gray-600 dark:text-gray-400">
                      {item.label}
                    </span>
                    <span className="ml-auto shrink-0 font-medium text-gray-900 dark:text-gray-100">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Text summary for non-distribution types */
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          {breakdown.answerCount === 0 ? (
            <p className="italic">No answers yet</p>
          ) : (
            <p>
              {breakdown.answerCount} text{' '}
              {breakdown.answerCount === 1 ? 'response' : 'responses'}{' '}
              collected
            </p>
          )}
        </div>
      )}
    </div>
  );
}
