import type { QuestionType } from "./form";

export interface Answer {
  id: string;
  response_id: string;
  question_id: string;
  question_type: QuestionType;
  value: string | number | boolean | string[] | null;
  file_url?: string;
  created_at: string;
}

export interface Response {
  id: string;
  form_id: string;
  respondent_id?: string;
  started_at: string;
  completed_at?: string;
  is_complete: boolean;
  metadata: ResponseMetadata;
  created_at: string;
  updated_at: string;
}

export interface ResponseMetadata {
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  device_type?: "desktop" | "tablet" | "mobile";
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  time_to_complete_ms?: number;
}

export interface ResponseWithAnswers extends Response {
  answers: Answer[];
}

export interface QuestionSummary {
  question_id: string;
  question_title: string;
  question_type: QuestionType;
  total_answers: number;
  skip_count: number;
  choices_distribution?: Record<string, number>;
  average_value?: number;
  min_value?: number;
  max_value?: number;
  text_responses?: string[];
}

export interface AnalyticsSummary {
  form_id: string;
  total_responses: number;
  completed_responses: number;
  completion_rate: number;
  average_completion_time_ms: number;
  responses_per_day: Record<string, number>;
  device_breakdown: Record<string, number>;
  browser_breakdown: Record<string, number>;
  country_breakdown: Record<string, number>;
  question_summaries: QuestionSummary[];
  drop_off_rates: Record<string, number>;
}
