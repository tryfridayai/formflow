import type { QuestionType, QuestionProperties } from "@/lib/types/form";

export interface QuestionTypeDefinition {
  type: QuestionType;
  label: string;
  description: string;
  icon: string;
  category: "text" | "choice" | "rating" | "date" | "media" | "layout";
  defaultProperties: QuestionProperties;
}

/**
 * Complete definitions for all 15 question types.
 * Each entry includes the Lucide icon name (for dynamic rendering),
 * a human-readable label, and fully populated default properties.
 */
export const QUESTION_TYPE_DEFINITIONS: Record<QuestionType, QuestionTypeDefinition> = {
  short_text: {
    type: "short_text",
    label: "Short Text",
    description: "Single-line text input",
    icon: "Type",
    category: "text",
    defaultProperties: {
      type: "short_text",
      config: {
        placeholder: "Type your answer here...",
        max_length: 255,
      },
    },
  },
  long_text: {
    type: "long_text",
    label: "Long Text",
    description: "Multi-line text area",
    icon: "AlignLeft",
    category: "text",
    defaultProperties: {
      type: "long_text",
      config: {
        placeholder: "Type your answer here...",
        max_length: 5000,
      },
    },
  },
  email: {
    type: "email",
    label: "Email",
    description: "Email address input with validation",
    icon: "Mail",
    category: "text",
    defaultProperties: {
      type: "email",
      config: {
        placeholder: "name@example.com",
      },
    },
  },
  number: {
    type: "number",
    label: "Number",
    description: "Numeric input with optional range",
    icon: "Hash",
    category: "text",
    defaultProperties: {
      type: "number",
      config: {
        placeholder: "Type a number...",
      },
    },
  },
  phone: {
    type: "phone",
    label: "Phone Number",
    description: "Phone number with country code",
    icon: "Phone",
    category: "text",
    defaultProperties: {
      type: "phone",
      config: {
        default_country_code: "+1",
        placeholder: "(555) 000-0000",
      },
    },
  },
  multiple_choice: {
    type: "multiple_choice",
    label: "Multiple Choice",
    description: "Select one or more options",
    icon: "ListChecks",
    category: "choice",
    defaultProperties: {
      type: "multiple_choice",
      config: {
        choices: [
          { id: "choice-1", label: "Option 1", value: "option_1" },
          { id: "choice-2", label: "Option 2", value: "option_2" },
          { id: "choice-3", label: "Option 3", value: "option_3" },
        ],
        allow_multiple: false,
        randomize: false,
        other_option: false,
      },
    },
  },
  dropdown: {
    type: "dropdown",
    label: "Dropdown",
    description: "Select from a dropdown list",
    icon: "ChevronDown",
    category: "choice",
    defaultProperties: {
      type: "dropdown",
      config: {
        choices: [
          { id: "choice-1", label: "Option 1", value: "option_1" },
          { id: "choice-2", label: "Option 2", value: "option_2" },
          { id: "choice-3", label: "Option 3", value: "option_3" },
        ],
        placeholder: "Select an option...",
        alphabetical_order: false,
      },
    },
  },
  rating: {
    type: "rating",
    label: "Rating",
    description: "Star or emoji rating scale",
    icon: "Star",
    category: "rating",
    defaultProperties: {
      type: "rating",
      config: {
        steps: 5,
        shape: "star",
      },
    },
  },
  opinion_scale: {
    type: "opinion_scale",
    label: "Opinion Scale",
    description: "Numeric scale (e.g., 0-10)",
    icon: "SlidersHorizontal",
    category: "rating",
    defaultProperties: {
      type: "opinion_scale",
      config: {
        steps: 10,
        start_at_zero: true,
        labels: {
          left: "Not likely",
          center: "",
          right: "Very likely",
        },
      },
    },
  },
  date: {
    type: "date",
    label: "Date",
    description: "Date picker",
    icon: "Calendar",
    category: "date",
    defaultProperties: {
      type: "date",
      config: {
        format: "MM/DD/YYYY",
        separator: "/",
      },
    },
  },
  yes_no: {
    type: "yes_no",
    label: "Yes / No",
    description: "Simple binary choice",
    icon: "ToggleLeft",
    category: "choice",
    defaultProperties: {
      type: "yes_no",
      config: {
        positive_label: "Yes",
        negative_label: "No",
      },
    },
  },
  file_upload: {
    type: "file_upload",
    label: "File Upload",
    description: "Allow file attachments",
    icon: "Upload",
    category: "media",
    defaultProperties: {
      type: "file_upload",
      config: {
        max_size_mb: 10,
        allowed_types: ["image/*", "application/pdf", ".doc", ".docx", ".xls", ".xlsx"],
      },
    },
  },
  url: {
    type: "url",
    label: "Website URL",
    description: "URL input with validation",
    icon: "Link",
    category: "text",
    defaultProperties: {
      type: "url",
      config: {
        placeholder: "https://",
      },
    },
  },
  welcome_screen: {
    type: "welcome_screen",
    label: "Welcome Screen",
    description: "Introductory screen before questions",
    icon: "Hand",
    category: "layout",
    defaultProperties: {
      type: "welcome_screen",
      config: {
        button_text: "Start",
        show_button: true,
        description: "",
      },
    },
  },
  end_screen: {
    type: "end_screen",
    label: "End Screen",
    description: "Thank you screen after completion",
    icon: "PartyPopper",
    category: "layout",
    defaultProperties: {
      type: "end_screen",
      config: {
        show_button: false,
        share_icons: true,
        description: "Thanks for completing this form!",
      },
    },
  },
};

/**
 * Grouped question types by category for the builder sidebar.
 */
export const QUESTION_TYPE_CATEGORIES = [
  {
    label: "Text",
    types: ["short_text", "long_text", "email", "number", "phone", "url"] as QuestionType[],
  },
  {
    label: "Choice",
    types: ["multiple_choice", "dropdown", "yes_no"] as QuestionType[],
  },
  {
    label: "Rating",
    types: ["rating", "opinion_scale"] as QuestionType[],
  },
  {
    label: "Date & Media",
    types: ["date", "file_upload"] as QuestionType[],
  },
  {
    label: "Layout",
    types: ["welcome_screen", "end_screen"] as QuestionType[],
  },
];

/**
 * Default form settings for a newly created form.
 */
export const DEFAULT_FORM_SETTINGS = {
  show_progress_bar: true,
  enable_navigation: true,
  one_response_per_user: false,
  show_question_numbers: true,
  notification_emails: [],
} as const;

/**
 * Maximum limits for the platform.
 */
export const LIMITS = {
  MAX_QUESTIONS_PER_FORM: 100,
  MAX_CHOICES_PER_QUESTION: 50,
  MAX_LOGIC_RULES_PER_QUESTION: 20,
  MAX_FILE_SIZE_MB: 50,
  MAX_TITLE_LENGTH: 256,
  MAX_DESCRIPTION_LENGTH: 2000,
  SLUG_SUFFIX_LENGTH: 6,
} as const;
