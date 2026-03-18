'use client';

import { useCallback, useEffect, useState } from 'react';
import { getResponses } from '@/lib/actions/responses';

interface ResponseFilters {
  startDate?: string;
  endDate?: string;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
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

export function useResponses(
  formId: string,
  options?: { pageSize?: number }
) {
  const [responses, setResponses] = useState<ResponseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: options?.pageSize || 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<ResponseFilters>({});

  const fetchResponses = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      setError(null);

      try {
        const result = await getResponses(
          formId,
          page,
          pagination.pageSize,
          filters as Record<string, unknown>
        );

        if (result.error) {
          setError(result.error);
          setResponses([]);
        } else {
          setResponses((result.data as ResponseRecord[]) || []);
          if (result.pagination) {
            setPagination(result.pagination);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch responses');
        setResponses([]);
      } finally {
        setLoading(false);
      }
    },
    [formId, pagination.pageSize, filters]
  );

  useEffect(() => {
    fetchResponses(1);
  }, [fetchResponses]);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.totalPages) {
        fetchResponses(page);
      }
    },
    [fetchResponses, pagination.totalPages]
  );

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      goToPage(pagination.page + 1);
    }
  }, [pagination.page, pagination.totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      goToPage(pagination.page - 1);
    }
  }, [pagination.page, goToPage]);

  const applyFilters = useCallback((newFilters: ResponseFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    responses,
    loading,
    error,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    applyFilters,
    clearFilters,
    refresh: () => fetchResponses(pagination.page),
  };
}
