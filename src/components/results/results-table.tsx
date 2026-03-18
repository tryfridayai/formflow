'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import type { Question } from '@/lib/types/form';

interface ResponseRecord {
  id: string;
  form_id: string;
  started_at: string;
  completed_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  answers: Array<{
    id: string;
    response_id: string;
    question_id: string;
    value: string;
    created_at: string;
  }>;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ResultsTableProps {
  responses: ResponseRecord[];
  questions: Question[];
  pagination: PaginationInfo;
  loading: boolean;
  onPageChange: (page: number) => void;
  onSelectResponse: (response: ResponseRecord) => void;
}

type SortDirection = 'asc' | 'desc';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return '--';
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  const seconds = Math.round((end - start) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  return `${mins}m ${seconds % 60}s`;
}

function parseAnswerValue(value: string): string {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.join(', ');
    return String(parsed);
  } catch {
    return value;
  }
}

export function ResultsTable({
  responses,
  questions,
  pagination,
  loading,
  onPageChange,
  onSelectResponse,
}: ResultsTableProps) {
  const [sortColumn, setSortColumn] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const visibleQuestions = useMemo(
    () =>
      questions
        .filter(
          (q) => q.type !== 'welcome_screen' && q.type !== 'end_screen'
        )
        .sort((a, b) => a.order_index - b.order_index)
        .slice(0, 5), // Show max 5 question columns
    [questions]
  );

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const sortedResponses = useMemo(() => {
    const sorted = [...responses];
    sorted.sort((a, b) => {
      let valA: string | number;
      let valB: string | number;

      if (sortColumn === 'created_at') {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      } else {
        valA = sortColumn;
        valB = sortColumn;
      }

      if (sortDirection === 'asc') {
        return valA < valB ? -1 : valA > valB ? 1 : 0;
      }
      return valA > valB ? -1 : valA < valB ? 1 : 0;
    });
    return sorted;
  }, [responses, sortColumn, sortDirection]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No responses yet. Share your form to start collecting responses.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
              <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                #
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-xs font-medium text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => handleSort('created_at')}
              >
                <span className="inline-flex items-center gap-1">
                  Date
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                Duration
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                Status
              </th>
              {visibleQuestions.map((q) => (
                <th
                  key={q.id}
                  className="max-w-[200px] truncate px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400"
                  title={q.title}
                >
                  {q.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedResponses.map((response, index) => {
              const rowNumber =
                (pagination.page - 1) * pagination.pageSize + index + 1;
              const isComplete = !!response.completed_at;
              const answerMap = new Map<string, string>();
              for (const a of response.answers) {
                answerMap.set(a.question_id, parseAnswerValue(a.value));
              }

              return (
                <motion.tr
                  key={response.id}
                  className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800/50 dark:hover:bg-gray-800/50"
                  onClick={() => onSelectResponse(response)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">
                    {rowNumber}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                    {formatDate(response.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-gray-400">
                    {formatDuration(response.started_at, response.completed_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={isComplete ? 'success' : 'warning'}>
                      {isComplete ? 'Complete' : 'Partial'}
                    </Badge>
                  </td>
                  {visibleQuestions.map((q) => (
                    <td
                      key={q.id}
                      className="max-w-[200px] truncate px-4 py-3 text-gray-600 dark:text-gray-400"
                      title={answerMap.get(q.id) ?? ''}
                    >
                      {answerMap.get(q.id) ?? (
                        <span className="text-gray-300 dark:text-gray-600">
                          --
                        </span>
                      )}
                    </td>
                  ))}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} -{' '}
            {Math.min(
              pagination.page * pagination.pageSize,
              pagination.total
            )}{' '}
            of {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 transition-colors dark:border-gray-700',
                pagination.page <= 1
                  ? 'cursor-not-allowed opacity-40'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-sm text-gray-600 dark:text-gray-400">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 transition-colors dark:border-gray-700',
                pagination.page >= pagination.totalPages
                  ? 'cursor-not-allowed opacity-40'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
