export const QUESTION_TYPES = [
  "short_text",
  "long_text",
  "email",
  "number",
  "phone",
  "multiple_choice",
  "dropdown",
  "rating",
  "opinion_scale",
  "date",
  "yes_no",
  "file_upload",
  "url",
  "welcome_screen",
  "end_screen",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export type FormStatus = "draft" | "published" | "closed" | "archived";

export type LogicOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "greater_than"
  | "less_than"
  | "is_empty"
  | "is_not_empty";

export interface LogicRule {
  id: string;
  question_id: string;
  operator: LogicOperator;
  value: string | number | boolean | null;
  destination_question_id: string;
}

export interface TextProperties {
  placeholder?: string;
  max_length?: number;
}

export interface NumberProperties {
  min?: number;
  max?: number;
  placeholder?: string;
}

export interface ChoiceOption {
  id: string;
  label: string;
  value: string;
}

export interface MultipleChoiceProperties {
  choices: ChoiceOption[];
  allow_multiple: boolean;
  randomize: boolean;
  other_option: boolean;
}

export interface DropdownProperties {
  choices: ChoiceOption[];
  placeholder?: string;
  alphabetical_order: boolean;
}

export interface RatingProperties {
  steps: number;
  shape: "star" | "heart" | "thumbsup" | "circle";
}

export interface OpinionScaleProperties {
  steps: number;
  start_at_zero: boolean;
  labels: {
    left?: string;
    center?: string;
    right?: string;
  };
}

export interface DateProperties {
  format: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  separator: "/" | "-" | ".";
}

export interface YesNoProperties {
  positive_label: string;
  negative_label: string;
}

export interface FileUploadProperties {
  max_size_mb: number;
  allowed_types: string[];
}

export interface UrlProperties {
  placeholder?: string;
}

export interface WelcomeScreenProperties {
  button_text: string;
  show_button: boolean;
  description?: string;
  image_url?: string;
}

export interface EndScreenProperties {
  button_text?: string;
  button_url?: string;
  show_button: boolean;
  description?: string;
  share_icons: boolean;
  redirect_url?: string;
  redirect_delay?: number;
}

export interface EmailProperties {
  placeholder?: string;
}

export interface PhoneProperties {
  default_country_code?: string;
  placeholder?: string;
}

export type QuestionProperties =
  | { type: "short_text"; config: TextProperties }
  | { type: "long_text"; config: TextProperties }
  | { type: "email"; config: EmailProperties }
  | { type: "number"; config: NumberProperties }
  | { type: "phone"; config: PhoneProperties }
  | { type: "multiple_choice"; config: MultipleChoiceProperties }
  | { type: "dropdown"; config: DropdownProperties }
  | { type: "rating"; config: RatingProperties }
  | { type: "opinion_scale"; config: OpinionScaleProperties }
  | { type: "date"; config: DateProperties }
  | { type: "yes_no"; config: YesNoProperties }
  | { type: "file_upload"; config: FileUploadProperties }
  | { type: "url"; config: UrlProperties }
  | { type: "welcome_screen"; config: WelcomeScreenProperties }
  | { type: "end_screen"; config: EndScreenProperties };

export interface Question {
  id: string;
  form_id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order_index: number;
  properties: QuestionProperties;
  logic_rules: LogicRule[];
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: string;
  form_id?: string;
  user_id?: string;
  name: string;
  font_family: string;
  question_color: string;
  answer_color: string;
  button_color: string;
  button_text_color: string;
  background_color: string;
  background_image_url?: string;
  background_opacity: number;
  border_radius: number;
  is_preset: boolean;
  created_at: string;
  updated_at: string;
}

export interface Form {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  slug: string;
  status: FormStatus;
  theme_id?: string;
  theme?: Theme;
  questions: Question[];
  settings: FormSettings;
  created_at: string;
  updated_at: string;
  published_at?: string;
  closed_at?: string;
  response_count: number;
}

export interface FormSettings {
  show_progress_bar: boolean;
  enable_navigation: boolean;
  one_response_per_user: boolean;
  show_question_numbers: boolean;
  close_date?: string;
  max_responses?: number;
  password?: string;
  notification_emails: string[];
  redirect_on_complete?: string;
  meta_title?: string;
  meta_description?: string;
  meta_image_url?: string;
}
