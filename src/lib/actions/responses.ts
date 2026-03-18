'use server';

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const submitResponseSchema = z.object({
  formId: z.string().uuid('Invalid form ID'),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const getResponsesSchema = z.object({
  formId: z.string().uuid('Invalid form ID'),
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(20),
});

const responseIdSchema = z.object({
  responseId: z.string().uuid('Invalid response ID'),
});

const formIdSchema = z.object({
  formId: z.string().uuid('Invalid form ID'),
});

/**
 * Submit a response to a published form.
 * This action does NOT require authentication -- public form submissions.
 */
export async function submitResponse(
  formId: string,
  answers: Record<string, string | string[]>,
  metadata?: Record<string, unknown>
) {
  const parsed = submitResponseSchema.safeParse({ formId, answers, metadata });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createClient();

  // Verify the form exists and is published
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('id, status')
    .eq('id', formId)
    .single();

  if (formError || !form) {
    return { error: 'Form not found.' };
  }

  if (form.status !== 'published') {
    return { error: 'This form is not currently accepting responses.' };
  }

  // Fetch questions to validate required fields
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('id, type, required, title')
    .eq('form_id', formId);

  if (questionsError) {
    return { error: 'Failed to validate form questions.' };
  }

  // Validate required questions have answers
  const requiredQuestions = (questions || []).filter(
    (q) => q.required && q.type !== 'welcome_screen' && q.type !== 'end_screen'
  );

  for (const q of requiredQuestions) {
    const answer = parsed.data.answers[q.id];
    if (answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
      return { error: `"${q.title}" is required.` };
    }
  }

  const responseId = uuidv4();
  const now = new Date().toISOString();

  // Create the response record
  const { error: responseError } = await supabase.from('responses').insert({
    id: responseId,
    form_id: formId,
    started_at: metadata?.started_at || now,
    completed_at: now,
    is_complete: true,
    metadata: metadata || {},
    created_at: now,
  });

  if (responseError) {
    return { error: responseError.message };
  }

  // Create answer records
  const answerRecords = Object.entries(parsed.data.answers)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([questionId, value]) => ({
      id: uuidv4(),
      response_id: responseId,
      question_id: questionId,
      value: Array.isArray(value) ? JSON.stringify(value) : value,
      created_at: now,
    }));

  if (answerRecords.length > 0) {
    const { error: answersError } = await supabase
      .from('answers')
      .insert(answerRecords);

    if (answersError) {
      // Clean up the response if answers failed
      await supabase.from('responses').delete().eq('id', responseId);
      return { error: answersError.message };
    }
  }

  // Increment response_count on the form
  await supabase.rpc('increment_response_count', { form_id_input: formId }).then(
    // If the RPC doesn't exist, fall back to a manual update
    async (result) => {
      if (result.error) {
        const { data: currentForm } = await supabase
          .from('forms')
          .select('response_count')
          .eq('id', formId)
          .single();

        if (currentForm) {
          await supabase
            .from('forms')
            .update({
              response_count: (currentForm.response_count || 0) + 1,
              updated_at: now,
            })
            .eq('id', formId);
        }
      }
    }
  );

  revalidatePath(`/forms/${formId}/responses`);
  return { success: true, responseId };
}

export async function getResponses(
  formId: string,
  page: number = 1,
  pageSize: number = 20,
  filters?: Record<string, unknown>
) {
  const parsed = getResponsesSchema.safeParse({ formId, page, pageSize });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'You must be logged in.' };
  }

  // Verify form ownership
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('id')
    .eq('id', formId)
    .eq('user_id', user.id)
    .single();

  if (formError || !form) {
    return { error: 'Form not found.' };
  }

  const offset = (parsed.data.page - 1) * parsed.data.pageSize;

  // Build query
  let query = supabase
    .from('responses')
    .select('*, answers(*)', { count: 'exact' })
    .eq('form_id', formId)
    .order('created_at', { ascending: false })
    .range(offset, offset + parsed.data.pageSize - 1);

  // Apply date range filter if provided
  if (filters?.startDate && typeof filters.startDate === 'string') {
    query = query.gte('created_at', filters.startDate);
  }
  if (filters?.endDate && typeof filters.endDate === 'string') {
    query = query.lte('created_at', filters.endDate);
  }

  const { data: responses, error: responsesError, count } = await query;

  if (responsesError) {
    return { error: responsesError.message };
  }

  return {
    data: responses || [],
    pagination: {
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / parsed.data.pageSize),
    },
  };
}

export async function getResponseDetail(responseId: string) {
  const parsed = responseIdSchema.safeParse({ responseId });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'You must be logged in.' };
  }

  // Fetch the response with answers
  const { data: response, error: responseError } = await supabase
    .from('responses')
    .select('*, answers(*)')
    .eq('id', responseId)
    .single();

  if (responseError || !response) {
    return { error: 'Response not found.' };
  }

  // Verify form ownership
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('id')
    .eq('id', response.form_id)
    .eq('user_id', user.id)
    .single();

  if (formError || !form) {
    return { error: 'Form not found.' };
  }

  return { data: response };
}

export async function getFormAnalytics(formId: string) {
  const parsed = formIdSchema.safeParse({ formId });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'You must be logged in.' };
  }

  // Verify form ownership
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('id, response_count')
    .eq('id', formId)
    .eq('user_id', user.id)
    .single();

  if (formError || !form) {
    return { error: 'Form not found.' };
  }

  // Fetch all responses for analytics
  const { data: responses, error: responsesError } = await supabase
    .from('responses')
    .select('id, started_at, completed_at, created_at')
    .eq('form_id', formId)
    .order('created_at', { ascending: true });

  if (responsesError) {
    return { error: responsesError.message };
  }

  const allResponses = responses || [];
  const totalResponses = allResponses.length;

  // Completion rate: responses that have completed_at set
  const completedResponses = allResponses.filter((r) => r.completed_at !== null);
  const completionRate =
    totalResponses > 0
      ? Math.round((completedResponses.length / totalResponses) * 100)
      : 0;

  // Average duration in seconds
  let avgDuration = 0;
  const durationsMs = completedResponses
    .filter((r) => r.started_at && r.completed_at)
    .map((r) => {
      const start = new Date(r.started_at).getTime();
      const end = new Date(r.completed_at!).getTime();
      return end - start;
    })
    .filter((d) => d > 0);

  if (durationsMs.length > 0) {
    avgDuration = Math.round(
      durationsMs.reduce((sum, d) => sum + d, 0) / durationsMs.length / 1000
    );
  }

  // Responses over time (group by day)
  const responsesOverTime: Record<string, number> = {};
  for (const r of allResponses) {
    const day = r.created_at.slice(0, 10); // YYYY-MM-DD
    responsesOverTime[day] = (responsesOverTime[day] || 0) + 1;
  }

  const timeline = Object.entries(responsesOverTime)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Per-question breakdowns
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('id, title, type, required')
    .eq('form_id', formId)
    .not('type', 'in', '("welcome_screen","end_screen")')
    .order('order_index', { ascending: true });

  if (questionsError) {
    return { error: questionsError.message };
  }

  // Fetch all answers for this form's responses
  const responseIds = allResponses.map((r) => r.id);

  let allAnswers: Array<{ question_id: string; value: string }> = [];
  if (responseIds.length > 0) {
    // Fetch in batches to avoid query limits
    const batchSize = 500;
    for (let i = 0; i < responseIds.length; i += batchSize) {
      const batch = responseIds.slice(i, i + batchSize);
      const { data: batchAnswers } = await supabase
        .from('answers')
        .select('question_id, value')
        .in('response_id', batch);

      if (batchAnswers) {
        allAnswers = allAnswers.concat(batchAnswers);
      }
    }
  }

  // Build per-question stats
  const questionBreakdowns = (questions || []).map((q) => {
    const questionAnswers = allAnswers.filter((a) => a.question_id === q.id);
    const answerCount = questionAnswers.length;
    const responseRate =
      totalResponses > 0 ? Math.round((answerCount / totalResponses) * 100) : 0;

    // For choice-based questions, calculate distribution
    let distribution: Record<string, number> | undefined;
    if (
      q.type === 'multiple_choice' ||
      q.type === 'dropdown' ||
      q.type === 'yes_no' ||
      q.type === 'rating' ||
      q.type === 'opinion_scale'
    ) {
      distribution = {};
      for (const a of questionAnswers) {
        // Handle array values stored as JSON
        let values: string[];
        try {
          const parsed = JSON.parse(a.value);
          values = Array.isArray(parsed) ? parsed : [a.value];
        } catch {
          values = [a.value];
        }
        for (const v of values) {
          distribution[v] = (distribution[v] || 0) + 1;
        }
      }
    }

    return {
      questionId: q.id,
      title: q.title,
      type: q.type,
      answerCount,
      responseRate,
      distribution,
    };
  });

  return {
    data: {
      totalResponses,
      completionRate,
      avgDurationSeconds: avgDuration,
      responsesOverTime: timeline,
      questionBreakdowns,
    },
  };
}

export async function exportCSV(formId: string) {
  const parsed = formIdSchema.safeParse({ formId });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'You must be logged in.' };
  }

  // Verify form ownership
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('id, title')
    .eq('id', formId)
    .eq('user_id', user.id)
    .single();

  if (formError || !form) {
    return { error: 'Form not found.' };
  }

  // Fetch questions for headers
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('id, title, type')
    .eq('form_id', formId)
    .not('type', 'in', '("welcome_screen","end_screen")')
    .order('order_index', { ascending: true });

  if (questionsError) {
    return { error: questionsError.message };
  }

  // Fetch all responses with answers
  const { data: responses, error: responsesError } = await supabase
    .from('responses')
    .select('id, created_at, completed_at, started_at, answers(question_id, value)')
    .eq('form_id', formId)
    .order('created_at', { ascending: true });

  if (responsesError) {
    return { error: responsesError.message };
  }

  const questionList = questions || [];
  const responseList = responses || [];

  // Build CSV header
  const headers = [
    'Response ID',
    'Submitted At',
    'Started At',
    'Completed At',
    ...questionList.map((q) => q.title),
  ];

  // Escape CSV value
  function escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  // Build CSV rows
  const rows = responseList.map((response) => {
    const answerMap = new Map<string, string>();
    const answers = (response as { answers?: Array<{ question_id: string; value: string }> }).answers || [];
    for (const answer of answers) {
      let displayValue = answer.value || '';
      try {
        const parsed = JSON.parse(displayValue);
        if (Array.isArray(parsed)) {
          displayValue = parsed.join('; ');
        }
      } catch {
        // value is already a plain string
      }
      answerMap.set(answer.question_id, displayValue);
    }

    return [
      response.id,
      response.created_at || '',
      response.started_at || '',
      response.completed_at || '',
      ...questionList.map((q) => answerMap.get(q.id) || ''),
    ];
  });

  // Assemble CSV
  const csvLines = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ];

  const csvContent = csvLines.join('\n');

  return { data: csvContent, filename: `${form.title || 'form'}-responses.csv` };
}

export async function deleteResponse(responseId: string) {
  const parsed = responseIdSchema.safeParse({ responseId });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'You must be logged in.' };
  }

  // Fetch the response to get form_id
  const { data: response, error: fetchError } = await supabase
    .from('responses')
    .select('form_id')
    .eq('id', responseId)
    .single();

  if (fetchError || !response) {
    return { error: 'Response not found.' };
  }

  // Verify form ownership
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('id, response_count')
    .eq('id', response.form_id)
    .eq('user_id', user.id)
    .single();

  if (formError || !form) {
    return { error: 'Form not found.' };
  }

  // Delete answers first
  await supabase.from('answers').delete().eq('response_id', responseId);

  // Delete the response
  const { error: deleteError } = await supabase
    .from('responses')
    .delete()
    .eq('id', responseId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  // Decrement response count
  const newCount = Math.max(0, (form.response_count || 1) - 1);
  await supabase
    .from('forms')
    .update({
      response_count: newCount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', response.form_id);

  revalidatePath(`/forms/${response.form_id}/responses`);
  return { success: true };
}
