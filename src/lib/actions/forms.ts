'use server';

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { generateSlug } from '@/lib/utils/slug';
import type { Form } from '@/lib/types/form';

const createFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
});

const updateFormSchema = z.object({
  formId: z.string().uuid('Invalid form ID'),
});

export async function createForm(title: string) {
  const parsed = createFormSchema.safeParse({ title });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'You must be logged in to create a form.' };
  }

  const formId = uuidv4();
  const slug = generateSlug(parsed.data.title);
  const now = new Date().toISOString();

  const { error: insertError } = await supabase.from('forms').insert({
    id: formId,
    user_id: user.id,
    title: parsed.data.title,
    slug,
    status: 'draft',
    theme: {
      primaryColor: '#6366f1',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      fontFamily: 'Inter',
      backgroundImage: null,
      darkMode: false,
      borderRadius: 'md',
    },
    show_progress_bar: true,
    allow_multiple_submissions: false,
    response_count: 0,
    created_at: now,
    updated_at: now,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  // Create default welcome screen
  const welcomeId = uuidv4();
  const endId = uuidv4();

  const { error: questionsError } = await supabase.from('questions').insert([
    {
      id: welcomeId,
      form_id: formId,
      type: 'welcome_screen',
      title: 'Welcome!',
      description: '',
      required: false,
      order_index: 0,
      properties: {
        type: 'welcome_screen',
        config: {
          button_text: 'Start',
          show_button: true,
        },
      },
      created_at: now,
      updated_at: now,
    },
    {
      id: endId,
      form_id: formId,
      type: 'end_screen',
      title: 'Thank you!',
      description: 'Your response has been recorded.',
      required: false,
      order_index: 1,
      properties: {
        type: 'end_screen',
        config: {
          show_button: false,
          share_icons: false,
        },
      },
      created_at: now,
      updated_at: now,
    },
  ]);

  if (questionsError) {
    // Clean up the form if questions failed to create
    await supabase.from('forms').delete().eq('id', formId);
    return { error: questionsError.message };
  }

  revalidatePath('/dashboard');
  redirect(`/forms/${formId}/edit`);
}

export async function updateForm(formId: string, data: Partial<Form>) {
  const parsedId = updateFormSchema.safeParse({ formId });
  if (!parsedId.success) {
    return { error: parsedId.error.issues[0].message };
  }

  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'You must be logged in.' };
  }

  // Only allow updating certain fields
  const allowedFields: string[] = [
    'title',
    'description',
    'theme',
    'show_progress_bar',
    'allow_multiple_submissions',
    'close_message',
    'redirect_url',
  ];

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  for (const key of allowedFields) {
    if (key in data) {
      updateData[key] = (data as Record<string, unknown>)[key];
    }
  }

  const { error: updateError } = await supabase
    .from('forms')
    .update(updateData)
    .eq('id', formId)
    .eq('user_id', user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath(`/forms/${formId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteForm(formId: string) {
  const parsed = updateFormSchema.safeParse({ formId });
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

  // Delete logic_rules, answers (via responses), questions, responses, then form
  // Supabase cascading deletes should handle this if FK constraints are set,
  // but we do it explicitly for safety.

  // Delete logic rules
  await supabase.from('logic_rules').delete().eq('form_id', formId);

  // Delete answers for all responses of this form
  const { data: responses } = await supabase
    .from('responses')
    .select('id')
    .eq('form_id', formId);

  if (responses && responses.length > 0) {
    const responseIds = responses.map((r) => r.id);
    await supabase.from('answers').delete().in('response_id', responseIds);
  }

  // Delete responses
  await supabase.from('responses').delete().eq('form_id', formId);

  // Delete questions
  await supabase.from('questions').delete().eq('form_id', formId);

  // Delete the form
  const { error: deleteError } = await supabase
    .from('forms')
    .delete()
    .eq('id', formId)
    .eq('user_id', user.id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function publishForm(formId: string) {
  const parsed = updateFormSchema.safeParse({ formId });
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

  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from('forms')
    .update({
      status: 'published',
      updated_at: now,
    })
    .eq('id', formId)
    .eq('user_id', user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath(`/forms/${formId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function closeForm(formId: string) {
  const parsed = updateFormSchema.safeParse({ formId });
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

  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from('forms')
    .update({
      status: 'closed',
      updated_at: now,
    })
    .eq('id', formId)
    .eq('user_id', user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath(`/forms/${formId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function duplicateForm(formId: string) {
  const parsed = updateFormSchema.safeParse({ formId });
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

  // Fetch original form
  const { data: originalForm, error: fetchError } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !originalForm) {
    return { error: 'Form not found.' };
  }

  // Fetch original questions
  const { data: originalQuestions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('form_id', formId)
    .order('order_index', { ascending: true });

  if (questionsError) {
    return { error: questionsError.message };
  }

  // Fetch original logic rules
  const { data: originalRules, error: rulesError } = await supabase
    .from('logic_rules')
    .select('*')
    .eq('form_id', formId);

  if (rulesError) {
    return { error: rulesError.message };
  }

  const newFormId = uuidv4();
  const now = new Date().toISOString();
  const slug = generateSlug(`${originalForm.title} (copy)`);

  // Create new form
  const { error: insertFormError } = await supabase.from('forms').insert({
    id: newFormId,
    user_id: user.id,
    title: `${originalForm.title} (copy)`,
    description: originalForm.description,
    slug,
    status: 'draft',
    theme: originalForm.theme,
    show_progress_bar: originalForm.show_progress_bar,
    allow_multiple_submissions: originalForm.allow_multiple_submissions,
    response_count: 0,
    created_at: now,
    updated_at: now,
  });

  if (insertFormError) {
    return { error: insertFormError.message };
  }

  // Build a mapping from old question IDs to new question IDs
  const questionIdMap = new Map<string, string>();
  const newQuestions = (originalQuestions || []).map((q) => {
    const newId = uuidv4();
    questionIdMap.set(q.id, newId);
    return {
      id: newId,
      form_id: newFormId,
      type: q.type,
      title: q.title,
      description: q.description,
      required: q.required,
      order_index: q.order_index,
      properties: q.properties,
      created_at: now,
      updated_at: now,
    };
  });

  if (newQuestions.length > 0) {
    const { error: insertQuestionsError } = await supabase
      .from('questions')
      .insert(newQuestions);

    if (insertQuestionsError) {
      await supabase.from('forms').delete().eq('id', newFormId);
      return { error: insertQuestionsError.message };
    }
  }

  // Duplicate logic rules with remapped question IDs
  if (originalRules && originalRules.length > 0) {
    const newRules = originalRules.map((rule) => ({
      id: uuidv4(),
      form_id: newFormId,
      source_question_id: questionIdMap.get(rule.source_question_id) || rule.source_question_id,
      condition: rule.condition,
      target_question_id: rule.target_question_id
        ? questionIdMap.get(rule.target_question_id) || rule.target_question_id
        : null,
      jump_to_end: rule.jump_to_end,
      created_at: now,
    }));

    const { error: insertRulesError } = await supabase
      .from('logic_rules')
      .insert(newRules);

    if (insertRulesError) {
      // Non-critical: form is still usable without logic
      console.error('Failed to duplicate logic rules:', insertRulesError.message);
    }
  }

  revalidatePath('/dashboard');
  return { success: true, formId: newFormId };
}

export async function getForm(formId: string) {
  const parsed = updateFormSchema.safeParse({ formId });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createClient();

  // Fetch the form
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .single();

  if (formError || !form) {
    return { error: 'Form not found.' };
  }

  // Fetch questions
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('form_id', formId)
    .order('order_index', { ascending: true });

  if (questionsError) {
    return { error: questionsError.message };
  }

  // Fetch logic rules
  const { data: logicRules, error: rulesError } = await supabase
    .from('logic_rules')
    .select('*')
    .eq('form_id', formId);

  if (rulesError) {
    return { error: rulesError.message };
  }

  // Attach logic rules to their respective questions
  const questionsWithRules = (questions || []).map((q) => ({
    ...q,
    logic_rules: (logicRules || []).filter(
      (rule) => rule.source_question_id === q.id
    ),
  }));

  return {
    data: {
      ...form,
      questions: questionsWithRules,
      logic_rules: logicRules || [],
    },
  };
}

export async function getUserForms() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'You must be logged in.' };
  }

  const { data: forms, error: formsError } = await supabase
    .from('forms')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (formsError) {
    return { error: formsError.message };
  }

  return { data: forms || [] };
}
