'use client';

import React, { useCallback, useState } from 'react';
import { ArrowRight, GitBranch, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { createRule, updateRule, deleteRule } from '@/lib/actions/logic';
import { QUESTION_TYPE_DEFINITIONS } from '@/lib/utils/constants';
import type { Form, Question, LogicOperator } from '@/lib/types/form';

const OPERATOR_OPTIONS = [
  { label: 'equals', value: 'equals' },
  { label: 'not equals', value: 'not_equals' },
  { label: 'contains', value: 'contains' },
  { label: 'greater than', value: 'greater_than' },
  { label: 'less than', value: 'less_than' },
  { label: 'is empty', value: 'is_empty' },
  { label: 'is not empty', value: 'is_not_empty' },
];

interface LogicRuleRow {
  id: string;
  source_question_id: string;
  condition: {
    operator: LogicOperator;
    value: string;
  };
  target_question_id: string | null;
  jump_to_end: boolean;
}

interface LogicEditorProps {
  form: Form;
  onRefresh: () => void;
}

export function LogicEditor({ form, onRefresh }: LogicEditorProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const questions = form.questions || [];
  const nonLayoutQuestions = questions.filter(
    (q) => q.type !== 'welcome_screen' && q.type !== 'end_screen'
  );

  // Gather all rules from questions
  // Note: DB rows may use source_question_id/condition/target_question_id/jump_to_end
  // while the TypeScript LogicRule type uses question_id/operator/value/destination_question_id
  const allRules: LogicRuleRow[] = questions.flatMap((q) =>
    (q.logic_rules || []).map((rule) => {
      const ruleAny = rule as unknown as Record<string, unknown>;
      const sourceId =
        (ruleAny.question_id as string) ||
        (ruleAny.source_question_id as string) ||
        q.id;
      const condition = ruleAny.condition as
        | { operator: LogicOperator; value: string }
        | undefined;
      const operator =
        (ruleAny.operator as LogicOperator) || condition?.operator || 'equals';
      const value =
        ruleAny.value !== undefined
          ? String(ruleAny.value ?? '')
          : String(condition?.value ?? '');
      const targetId =
        (ruleAny.destination_question_id as string | null) ??
        (ruleAny.target_question_id as string | null) ??
        null;
      const jumpToEnd =
        (ruleAny.jump_to_end as boolean | undefined) ?? targetId === null;
      return {
        id: ruleAny.id as string,
        source_question_id: sourceId,
        condition: { operator, value },
        target_question_id: targetId,
        jump_to_end: jumpToEnd,
      };
    })
  );

  // Group rules by source question
  const rulesByQuestion = new Map<string, LogicRuleRow[]>();
  for (const rule of allRules) {
    const existing = rulesByQuestion.get(rule.source_question_id) || [];
    existing.push(rule);
    rulesByQuestion.set(rule.source_question_id, existing);
  }

  const targetOptions = [
    ...questions.map((q) => ({
      label: `${q.order_index + 1}. ${q.title || QUESTION_TYPE_DEFINITIONS[q.type].label}`,
      value: q.id,
    })),
    { label: 'End of form', value: '__end__' },
  ];

  const handleAddRule = useCallback(
    async (questionId: string) => {
      setLoading(questionId);
      try {
        await createRule(
          form.id,
          questionId,
          { operator: 'equals', value: '' },
          null,
          true
        );
        onRefresh();
      } catch {
        // silent
      } finally {
        setLoading(null);
      }
    },
    [form.id, onRefresh]
  );

  const handleUpdateRule = useCallback(
    async (ruleId: string, data: Partial<LogicRuleRow>) => {
      setLoading(ruleId);
      try {
        const updateData: Record<string, unknown> = {};
        if (data.condition) {
          updateData.condition = data.condition;
        }
        if (data.target_question_id !== undefined) {
          if (data.target_question_id === '__end__' || data.target_question_id === null) {
            updateData.target_question_id = null;
            updateData.jump_to_end = true;
          } else {
            updateData.target_question_id = data.target_question_id;
            updateData.jump_to_end = false;
          }
        }
        await updateRule(ruleId, updateData);
        onRefresh();
      } catch {
        // silent
      } finally {
        setLoading(null);
      }
    },
    [onRefresh]
  );

  const handleDeleteRule = useCallback(
    async (ruleId: string) => {
      setLoading(ruleId);
      try {
        await deleteRule(ruleId);
        onRefresh();
      } catch {
        // silent
      } finally {
        setLoading(null);
      }
    },
    [onRefresh]
  );

  if (nonLayoutQuestions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <GitBranch className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">
            No questions yet
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add questions to your form before creating logic rules.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Logic Rules
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create conditional jumps between questions based on answers.
          </p>
        </div>

        <div className="space-y-6">
          {nonLayoutQuestions.map((question, qIdx) => {
            const rules = rulesByQuestion.get(question.id) || [];
            const definition = QUESTION_TYPE_DEFINITIONS[question.type];

            return (
              <div
                key={question.id}
                className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
              >
                {/* Question header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-100 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {qIdx + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {question.title || definition.label}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddRule(question.id)}
                    loading={loading === question.id}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add rule
                  </Button>
                </div>

                {/* Rules */}
                {rules.length === 0 ? (
                  <div className="px-4 py-4 text-center text-xs text-gray-400 dark:text-gray-500">
                    No logic rules. Responses proceed to the next question.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {rules.map((rule) => (
                      <LogicRuleEditor
                        key={rule.id}
                        rule={rule}
                        question={question}
                        targetOptions={targetOptions}
                        isLoading={loading === rule.id}
                        onUpdate={handleUpdateRule}
                        onDelete={handleDeleteRule}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---- Single Rule Row ---- */

interface LogicRuleEditorProps {
  rule: LogicRuleRow;
  question: Question;
  targetOptions: { label: string; value: string }[];
  isLoading: boolean;
  onUpdate: (ruleId: string, data: Partial<LogicRuleRow>) => void;
  onDelete: (ruleId: string) => void;
}

function LogicRuleEditor({
  rule,
  question,
  targetOptions,
  isLoading,
  onUpdate,
  onDelete,
}: LogicRuleEditorProps) {
  const needsValue =
    rule.condition.operator !== 'is_empty' &&
    rule.condition.operator !== 'is_not_empty';

  const currentTarget = rule.jump_to_end
    ? '__end__'
    : rule.target_question_id || '';

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3">
      <span className="shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">
        If answer
      </span>

      {/* Operator */}
      <select
        value={rule.condition.operator}
        onChange={(e) =>
          onUpdate(rule.id, {
            condition: {
              ...rule.condition,
              operator: e.target.value as LogicOperator,
            },
          })
        }
        className={cn(
          'h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700',
          'focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
          'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
        )}
      >
        {OPERATOR_OPTIONS.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      {/* Value */}
      {needsValue && (
        <input
          type="text"
          value={rule.condition.value}
          onChange={(e) =>
            onUpdate(rule.id, {
              condition: { ...rule.condition, value: e.target.value },
            })
          }
          placeholder="value"
          className={cn(
            'h-8 w-32 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700',
            'focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
            'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
          )}
        />
      )}

      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />

      <span className="shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">
        go to
      </span>

      {/* Target */}
      <select
        value={currentTarget}
        onChange={(e) =>
          onUpdate(rule.id, { target_question_id: e.target.value })
        }
        className={cn(
          'h-8 max-w-[200px] rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700',
          'focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
          'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
        )}
      >
        <option value="" disabled>
          Select target...
        </option>
        {targetOptions
          .filter((opt) => opt.value !== question.id)
          .map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>

      {/* Delete */}
      <button
        onClick={() => onDelete(rule.id)}
        disabled={isLoading}
        className={cn(
          'ml-auto rounded-md p-1.5 text-gray-400 transition-colors',
          'hover:bg-red-50 hover:text-red-600',
          'dark:hover:bg-red-950 dark:hover:text-red-400',
          'disabled:opacity-50'
        )}
        aria-label="Delete rule"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
