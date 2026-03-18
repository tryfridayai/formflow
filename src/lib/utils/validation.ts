import { z } from "zod";
import { QUESTION_TYPES } from "@/lib/types/form";

/**
 * Schema for a single choice option used in multiple choice / dropdown questions.
 */
const choiceOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1, "Choice label is required"),
  value: z.string().min(1),
});

/**
 * Schema for question properties. Uses a discriminated union on the `type` field
 * so each question type can have its own typed config.
 */
const questionPropertiesSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("short_text"),
    config: z.object({
      placeholder: z.string().optional(),
      max_length: z.number().int().positive().optional(),
    }),
  }),
  z.object({
    type: z.literal("long_text"),
    config: z.object({
      placeholder: z.string().optional(),
      max_length: z.number().int().positive().optional(),
    }),
  }),
  z.object({
    type: z.literal("email"),
    config: z.object({
      placeholder: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal("number"),
    config: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      placeholder: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal("phone"),
    config: z.object({
      default_country_code: z.string().optional(),
      placeholder: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal("multiple_choice"),
    config: z.object({
      choices: z.array(choiceOptionSchema).min(1, "At least one choice is required"),
      allow_multiple: z.boolean(),
      randomize: z.boolean(),
      other_option: z.boolean(),
    }),
  }),
  z.object({
    type: z.literal("dropdown"),
    config: z.object({
      choices: z.array(choiceOptionSchema).min(1, "At least one choice is required"),
      placeholder: z.string().optional(),
      alphabetical_order: z.boolean(),
    }),
  }),
  z.object({
    type: z.literal("rating"),
    config: z.object({
      steps: z.number().int().min(1).max(10),
      shape: z.enum(["star", "heart", "thumbsup", "circle"]),
    }),
  }),
  z.object({
    type: z.literal("opinion_scale"),
    config: z.object({
      steps: z.number().int().min(2).max(11),
      start_at_zero: z.boolean(),
      labels: z.object({
        left: z.string().optional(),
        center: z.string().optional(),
        right: z.string().optional(),
      }),
    }),
  }),
  z.object({
    type: z.literal("date"),
    config: z.object({
      format: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]),
      separator: z.enum(["/", "-", "."]),
    }),
  }),
  z.object({
    type: z.literal("yes_no"),
    config: z.object({
      positive_label: z.string().min(1),
      negative_label: z.string().min(1),
    }),
  }),
  z.object({
    type: z.literal("file_upload"),
    config: z.object({
      max_size_mb: z.number().positive().max(50),
      allowed_types: z.array(z.string()),
    }),
  }),
  z.object({
    type: z.literal("url"),
    config: z.object({
      placeholder: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal("welcome_screen"),
    config: z.object({
      button_text: z.string().min(1),
      show_button: z.boolean(),
      description: z.string().optional(),
      image_url: z.string().url().optional().or(z.literal("")),
    }),
  }),
  z.object({
    type: z.literal("end_screen"),
    config: z.object({
      button_text: z.string().optional(),
      button_url: z.string().url().optional().or(z.literal("")),
      show_button: z.boolean(),
      description: z.string().optional(),
      share_icons: z.boolean(),
      redirect_url: z.string().url().optional().or(z.literal("")),
      redirect_delay: z.number().int().nonnegative().optional(),
    }),
  }),
]);

/**
 * Schema for a logic rule attached to a question.
 */
const logicRuleSchema = z.object({
  id: z.string().min(1),
  question_id: z.string().min(1),
  operator: z.enum([
    "equals",
    "not_equals",
    "contains",
    "greater_than",
    "less_than",
    "is_empty",
    "is_not_empty",
  ]),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  destination_question_id: z.string().min(1),
});

/**
 * Schema for creating or updating a question within a form.
 */
export const questionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(QUESTION_TYPES),
  title: z.string().min(1, "Question title is required").max(256),
  description: z.string().max(2000).optional(),
  required: z.boolean(),
  order_index: z.number().int().nonnegative(),
  properties: questionPropertiesSchema,
  logic_rules: z.array(logicRuleSchema),
});

/**
 * Schema for form settings.
 */
const formSettingsSchema = z.object({
  show_progress_bar: z.boolean(),
  enable_navigation: z.boolean(),
  one_response_per_user: z.boolean(),
  show_question_numbers: z.boolean(),
  close_date: z.string().optional(),
  max_responses: z.number().int().positive().optional(),
  password: z.string().optional(),
  notification_emails: z.array(z.string().email()),
  redirect_on_complete: z.string().url().optional().or(z.literal("")),
  meta_title: z.string().max(256).optional(),
  meta_description: z.string().max(2000).optional(),
  meta_image_url: z.string().url().optional().or(z.literal("")),
});

/**
 * Schema for creating a new form.
 */
export const createFormSchema = z.object({
  title: z.string().min(1, "Form title is required").max(256),
  description: z.string().max(2000).optional(),
  questions: z.array(questionSchema).optional(),
  settings: formSettingsSchema.optional(),
});

/**
 * Schema for updating an existing form.
 * All fields are optional since partial updates are allowed.
 */
export const updateFormSchema = z.object({
  title: z.string().min(1, "Form title is required").max(256).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(["draft", "published", "closed", "archived"]).optional(),
  theme_id: z.string().optional().nullable(),
  questions: z.array(questionSchema).optional(),
  settings: formSettingsSchema.partial().optional(),
});

/**
 * Schema for a single answer submitted by a respondent.
 */
export const answerSchema = z.object({
  question_id: z.string().min(1),
  question_type: z.enum(QUESTION_TYPES),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.null()]),
  file_url: z.string().url().optional(),
});

/**
 * Schema for submitting a complete response to a form.
 */
export const submitResponseSchema = z.object({
  form_id: z.string().min(1),
  answers: z.array(answerSchema).min(1, "At least one answer is required"),
  started_at: z.string(),
  metadata: z
    .object({
      user_agent: z.string().optional(),
      referrer: z.string().optional(),
    })
    .optional(),
});

/**
 * Inferred TypeScript types from the schemas for use in server actions and API routes.
 */
export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type AnswerInput = z.infer<typeof answerSchema>;
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
