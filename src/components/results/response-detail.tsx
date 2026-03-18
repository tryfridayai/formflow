'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Clock, Calendar, Monitor } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { deleteResponse } from '@/lib/actions/responses';
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

interface ResponseDetailProps {
  response: ResponseRecord | null;
  questions: Question[];
  onClose: () => void;
  onDeleted: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return 'Not completed';
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds} seconds`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function parseValue(value: string): string {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.join(', ');
    return String(parsed);
  } catch {
    return value;
  }
}

export function ResponseDetail({
  response,
  questions,
  onClose,
  onDeleted,
}: ResponseDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const sortedQuestions = [...questions]
    .filter((q) => q.type !== 'welcome_screen' && q.type !== 'end_screen')
    .sort((a, b) => a.order_index - b.order_index);

  const handleDelete = useCallback(async () => {
    if (!response) return;
    setIsDeleting(true);
    try {
      const result = await deleteResponse(response.id);
      if (!result.error) {
        onDeleted();
        onClose();
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [response, onDeleted, onClose]);

  return (
    <AnimatePresence>
      {response && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-lg flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Response Detail
                </h2>
                <Badge
                  variant={response.completed_at ? 'success' : 'warning'}
                >
                  {response.completed_at ? 'Complete' : 'Partial'}
                </Badge>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Metadata */}
              <div className="mb-8 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(response.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {formatDuration(
                      response.started_at,
                      response.completed_at
                    )}
                  </span>
                </div>
                {response.metadata?.device_type != null && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Monitor className="h-3.5 w-3.5" />
                    <span>{String(response.metadata.device_type)}</span>
                  </div>
                )}
              </div>

              {/* Question / Answer pairs */}
              <div className="space-y-6">
                {sortedQuestions.map((q, index) => {
                  const answer = response.answers.find(
                    (a) => a.question_id === q.id
                  );
                  return (
                    <div
                      key={q.id}
                      className="border-b border-gray-100 pb-4 last:border-0 dark:border-gray-800/50"
                    >
                      <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                        {index + 1}. {q.title}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {answer ? (
                          parseValue(answer.value)
                        ) : (
                          <span className="italic text-gray-300 dark:text-gray-600">
                            Skipped
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <p className="flex-1 text-xs text-red-600">
                    Are you sure? This cannot be undone.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={isDeleting}
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete response
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
