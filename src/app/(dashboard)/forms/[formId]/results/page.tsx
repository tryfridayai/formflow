'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { BarChart3, Table } from 'lucide-react';
import { Tabs, TabList, TabTrigger, TabContent } from '@/components/ui/tabs';
import { ResultsSummary } from '@/components/results/results-summary';
import { ResultsFilters } from '@/components/results/results-filters';
import { ResultsTable } from '@/components/results/results-table';
import { ResponseDetail } from '@/components/results/response-detail';
import { ResponseTimeline } from '@/components/results/charts/response-timeline';
import { CompletionFunnel } from '@/components/results/charts/completion-funnel';
import { QuestionSummaryChart } from '@/components/results/charts/question-summary';
import { ExportButton } from '@/components/results/export-button';
import { useResponses } from '@/lib/hooks/use-responses';
import { getFormAnalytics } from '@/lib/actions/responses';
import type { Question, QuestionType } from '@/lib/types/form';

/* ----- Types for analytics data returned by the server action ----- */

interface QuestionBreakdown {
  questionId: string;
  title: string;
  type: QuestionType;
  answerCount: number;
  responseRate: number;
  distribution?: Record<string, number>;
}

interface AnalyticsData {
  totalResponses: number;
  completionRate: number;
  avgDurationSeconds: number;
  responsesOverTime: Array<{ date: string; count: number }>;
  questionBreakdowns: QuestionBreakdown[];
}

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

export default function ResultsPage() {
  const params = useParams<{ formId: string }>();
  const formId = params.formId;

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedResponse, setSelectedResponse] =
    useState<ResponseRecord | null>(null);

  const {
    responses,
    loading: responsesLoading,
    pagination,
    goToPage,
    applyFilters,
    clearFilters,
    refresh,
  } = useResponses(formId);

  /* Fetch analytics */
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const result = await getFormAnalytics(formId);
      if (result.data) {
        setAnalytics(result.data as unknown as AnalyticsData);
      }
    } finally {
      setAnalyticsLoading(false);
    }
  }, [formId]);

  /* Fetch form questions for table headers */
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  /* Derive questions from analytics breakdowns for table */
  useEffect(() => {
    if (analytics?.questionBreakdowns) {
      const qs: Question[] = analytics.questionBreakdowns.map(
        (b, index) =>
          ({
            id: b.questionId,
            form_id: formId,
            type: b.type,
            title: b.title,
            required: false,
            order_index: index,
            properties: { type: b.type, config: {} },
            logic_rules: [],
            created_at: '',
            updated_at: '',
          } as unknown as Question)
      );
      setQuestions(qs);
    }
  }, [analytics, formId]);

  const handleApplyFilters = (filters: {
    startDate?: string;
    endDate?: string;
    status?: 'all' | 'complete' | 'partial';
  }) => {
    applyFilters({
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
  };

  const handleResponseDeleted = () => {
    refresh();
    fetchAnalytics();
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Results
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            View and analyze your form responses
          </p>
        </div>
        <ExportButton formId={formId} />
      </div>

      {/* Summary cards */}
      <ResultsSummary analytics={analytics} loading={analyticsLoading} />

      {/* Filters */}
      <ResultsFilters
        onApplyFilters={handleApplyFilters}
        onClearFilters={clearFilters}
      />

      {/* Tabs */}
      <Tabs defaultValue="charts">
        <TabList>
          <TabTrigger value="charts">
            <BarChart3 className="mr-1.5 h-4 w-4" />
            Charts
          </TabTrigger>
          <TabTrigger value="responses">
            <Table className="mr-1.5 h-4 w-4" />
            Responses
          </TabTrigger>
        </TabList>

        {/* Charts tab */}
        <TabContent value="charts">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ResponseTimeline
                data={analytics?.responsesOverTime ?? []}
                loading={analyticsLoading}
              />
              <CompletionFunnel
                questionBreakdowns={analytics?.questionBreakdowns ?? []}
                totalResponses={analytics?.totalResponses ?? 0}
                loading={analyticsLoading}
              />
            </div>

            {/* Per-question summaries */}
            {analytics?.questionBreakdowns &&
              analytics.questionBreakdowns.length > 0 && (
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Per-Question Breakdown
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {analytics.questionBreakdowns.map((breakdown) => (
                      <QuestionSummaryChart
                        key={breakdown.questionId}
                        breakdown={breakdown}
                      />
                    ))}
                  </div>
                </div>
              )}
          </div>
        </TabContent>

        {/* Responses tab */}
        <TabContent value="responses">
          <ResultsTable
            responses={responses as unknown as ResponseRecord[]}
            questions={questions}
            pagination={pagination}
            loading={responsesLoading}
            onPageChange={goToPage}
            onSelectResponse={(r) => setSelectedResponse(r)}
          />
        </TabContent>
      </Tabs>

      {/* Response detail slide-over */}
      <ResponseDetail
        response={selectedResponse}
        questions={questions}
        onClose={() => setSelectedResponse(null)}
        onDeleted={handleResponseDeleted}
      />
    </div>
  );
}
