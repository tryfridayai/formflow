'use client';

import { useCallback, useEffect, useState } from 'react';
import { getUserForms } from '@/lib/actions/forms';
import type { Form } from '@/lib/types/form';

export function useForms() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForms = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getUserForms();

      if (result.error) {
        setError(result.error);
        setForms([]);
      } else {
        setForms((result.data as Form[]) || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forms');
      setForms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  return { forms, loading, error, refresh: fetchForms };
}
