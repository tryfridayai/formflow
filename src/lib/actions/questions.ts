'use server';

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { QUESTION_TYPE_DEFINITIONS } from '@/lib/utils/constants';
import type { QuestionType, Question, QuestionProperties } from '@/lib/types/form';

const createQuestionSchema = z.object({
  formId: z.string().uuid('Invalid form ID'),
  type: z.string(),
  orderIndex: z.number().int().min(0),
});

const updateQuestionSchema = z.object({
  questionId: z.string().uuid('Invalid question ID'),
});

const reorderSchema = z.object({
  formId: z.string().uuid('Invalid form ID'),
  orderedIds: z.array(z.string().uuid()),
});

function getDefaultProperties(type: QuestionType): QuestionProperties {
  const definition = QUESTION_TYPE_DEFINITIONS[type];
  return structuredClone(definition.defaultProperties);
}

function getDefaultTitle(type: QuestionType): string {
  const definition = QUESTION_TYPE_DEFINITIONS[type];
  return definition.label;
}

export async function createQuestion(
  formId: string,
  type: QuestionType,
  orderIndex: number
) {
  const parsed = createQuestionSchema.safeParse({ formId, type, orderIndex });
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

  // Shift existing questions at or after the new order_index
  const { data: existingQuestions } = await supabase
    .from('questions')
    .select('id, order_index')
    .eq('form_id', formId)
    .gte('order_index', orderIndex)
    .order('order_index', { ascending: false });

  if (existingQuestions && existingQuestions.length > 0) {
    for (const q of existingQuestions) {
      await supabase
        .from('questions')
        .update({ order_index: q.order_index + 1 })
        .eq('id', q.id);
    }
  }

  const questionId = uuidv4();
  const now = new Date().toISOString();
  const questionType = type as QuestionType;

  const { data: question, error: insertError } = await supabase
    .from('questions')
    .insert({
      id: questionId,
      form_id: formId,
      type: questionType,
      title: getDefaultTitle(questionType),
      description: '',
      required: type !== 'welcome_screen' && type !== 'end_screen',
      order_index: orderIndex,
      properties: getDefaultProperties(questionType),
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath(`/forms/${formId}`);
  return { data: question };
}

export async function updateQuestion(
  questionId: string,
  data: Partial<Question>
) {
  const parsed = updateQuestionSchema.safeParse({ questionId });
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

  // Fetch the question to get the form_id for ownership check
  const { data: existingQuestion, error: fetchError } = await supabase
    .from('questions')
    .select('form_id')
    .eq('id', questionId)
    .single();

  if (fetchError || !existingQuestion) {
    return { error: 'Question not found.' };
  }

  // Verify form ownership
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('id')
    .eq('id', existingQuestion.form_id)
    .eq('user_id', user.id)
    .single();

  if (formError || !form) {
    return { error: 'Form not found.' };
  }

  // Only allow updating certain fields
  const allowedFields: (keyof Question)[] = [
    'title',
    'description',
    'required',
    'properties',
    'type',
  ];

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  for (const key of allowedFields) {
    if (key in data) {
      updateData[key] = data[key as keyof typeof data];
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from('questions')
    .update(updateData)
    .eq('id', questionId)
    .select()
    .single();

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath(`/forms/${existingQuestion.form_id}`);
  return { data: updated };
}

export async function deleteQuestion(questionId: string) {
  const parsed = updateQuestionSchema.safeParse({ questionId });
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

  // Fetch question to get form_id and order_index
  const { data: question, error: fetchError } = await supabase
    .from('questions')
    .select('form_id, order_index')
    .eq('id', questionId)
    .single();

  if (fetchError || !question) {
    return { error: 'Question not found.' };
  }

  // Verify form ownership
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('id')
    .eq('id', question.form_id)
    .eq('user_id', user.id)
    .single();

  if (formError || !form) {
    return { error: 'Form not found.' };
  }

  // Delete associated logic rules
  await supabase
    .from('logic_rules')
    .delete()
    .or(`source_question_id.eq.${questionId},target_question_id.eq.${questionId}`);

  // Delete the question
  const { error: deleteError } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  // Reorder remaining questions to fill the gap
  const { data: remainingQuestions } = await supabase
    .from('questions')
    .select('id, order_index')
    .eq('form_id', question.form_id)
    .gt('order_index', question.order_index)
    .order('order_index', { ascending: true });

  if (remainingQuestions && remainingQuestions.length > 0) {
    for (const q of remainingQuestions) {
      await supabase
        .from('questions')
        .update({ order_index: q.order_index - 1 })
        .eq('id', q.id);
    }
  }

  revalidatePath(`/forms/${question.form_id}`);
  return { success: true };
}

export async function reorderQuestions(formId: string, orderedIds: string[]) {
  const parsed = reorderSchema.safeParse({ formId, orderedIds });
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

  // Batch update order_index for each question
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('questions')
      .update({ order_index: index, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('form_id', formId)
  );

  const results = await Promise.all(updates);

  const failed = results.find((r) => r.error);
  if (failed?.error) {
    return { error: failed.error.message };
  }

  revalidatePath(`/forms/${formId}`);
  return { success: true };
}
