'use client';

import { useCallback, useEffect, useState } from 'react';
import { getForm } from '@/lib/actions/forms';
import type { Form, Question, LogicRule } from '@/lib/types/form';

interface FormWithDetails extends Form {
  questions: Question[];
  logic_rules: LogicRule[];
}

export function useForm(formId: string | null) {
  const [form, setForm] = useState<FormWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForm = useCallback(async () => {
    if (!formId) {
      setForm(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getForm(formId);

      if (result.error) {
        setError(result.error);
        setForm(null);
      } else {
        setForm(result.data as FormWithDetails);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch form');
      setForm(null);
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  return { form, loading, error, refresh: fetchForm };
}
