'use server';

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const createRuleSchema = z.object({
  formId: z.string().uuid('Invalid form ID'),
  sourceQuestionId: z.string().uuid('Invalid source question ID'),
  condition: z.record(z.string(), z.unknown()),
  targetQuestionId: z.string().uuid().nullable(),
  jumpToEnd: z.boolean(),
});

const updateRuleSchema = z.object({
  ruleId: z.string().uuid('Invalid rule ID'),
  data: z.record(z.string(), z.unknown()),
});

const deleteRuleSchema = z.object({
  ruleId: z.string().uuid('Invalid rule ID'),
});

const getFormRulesSchema = z.object({
  formId: z.string().uuid('Invalid form ID'),
});

export async function createRule(
  formId: string,
  sourceQuestionId: string,
  condition: Record<string, unknown>,
  targetQuestionId: string | null,
  jumpToEnd: boolean
) {
  const parsed = createRuleSchema.safeParse({
    formId,
    sourceQuestionId,
    condition,
    targetQuestionId,
    jumpToEnd,
  });

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

  // Verify source question belongs to form
  const { data: sourceQuestion, error: sourceError } = await supabase
    .from('questions')
    .select('id')
    .eq('id', sourceQuestionId)
    .eq('form_id', formId)
    .single();

  if (sourceError || !sourceQuestion) {
    return { error: 'Source question not found in this form.' };
  }

  // Verify target question belongs to form (if provided)
  if (targetQuestionId) {
    const { data: targetQuestion, error: targetError } = await supabase
      .from('questions')
      .select('id')
      .eq('id', targetQuestionId)
      .eq('form_id', formId)
      .single();

    if (targetError || !targetQuestion) {
      return { error: 'Target question not found in this form.' };
    }
  }

  const ruleId = uuidv4();
  const now = new Date().toISOString();

  const { data: rule, error: insertError } = await supabase
    .from('logic_rules')
    .insert({
      id: ruleId,
      form_id: formId,
      source_question_id: sourceQuestionId,
      condition,
      target_question_id: targetQuestionId,
      jump_to_end: jumpToEnd,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath(`/forms/${formId}`);
  return { data: rule };
}

export async function updateRule(
  ruleId: string,
  data: Record<string, unknown>
) {
  const parsed = updateRuleSchema.safeParse({ ruleId, data });
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

  // Fetch the rule to get form_id
  const { data: existingRule, error: fetchError } = await supabase
    .from('logic_rules')
    .select('form_id')
    .eq('id', ruleId)
    .single();

  if (fetchError || !existingRule) {
    return { error: 'Rule not found.' };
  }

  // Verify form ownership
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('id')
    .eq('id', existingRule.form_id)
    .eq('user_id', user.id)
    .single();

  if (formError || !form) {
    return { error: 'Form not found.' };
  }

  // Only allow updating certain fields
  const allowedFields = [
    'condition',
    'target_question_id',
    'jump_to_end',
    'source_question_id',
  ];

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  for (const key of allowedFields) {
    if (key in data) {
      updateData[key] = data[key];
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from('logic_rules')
    .update(updateData)
    .eq('id', ruleId)
    .select()
    .single();

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath(`/forms/${existingRule.form_id}`);
  return { data: updated };
}

export async function deleteRule(ruleId: string) {
  const parsed = deleteRuleSchema.safeParse({ ruleId });
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

  // Fetch the rule to get form_id
  const { data: existingRule, error: fetchError } = await supabase
    .from('logic_rules')
    .select('form_id')
    .eq('id', ruleId)
    .single();

  if (fetchError || !existingRule) {
    return { error: 'Rule not found.' };
  }

  // Verify form ownership
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('id')
    .eq('id', existingRule.form_id)
    .eq('user_id', user.id)
    .single();

  if (formError || !form) {
    return { error: 'Form not found.' };
  }

  const { error: deleteError } = await supabase
    .from('logic_rules')
    .delete()
    .eq('id', ruleId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidatePath(`/forms/${existingRule.form_id}`);
  return { success: true };
}

export async function getFormRules(formId: string) {
  const parsed = getFormRulesSchema.safeParse({ formId });
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

  const { data: rules, error: rulesError } = await supabase
    .from('logic_rules')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: true });

  if (rulesError) {
    return { error: rulesError.message };
  }

  return { data: rules || [] };
}
