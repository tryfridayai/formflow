import type { LogicOperator, Question } from "@/lib/types/form";

/**
 * A map of question IDs to their current answer values.
 * The value can be a string, number, boolean, string array, or null.
 */
export type AnswersMap = Record<string, string | number | boolean | string[] | null | undefined>;

/**
 * Evaluate a single logic rule against the provided answers.
 *
 * Supported operators:
 *   - equals: strict equality (string comparison for primitives, includes-check for arrays)
 *   - not_equals: negation of equals
 *   - contains: checks if the answer string contains the rule value as a substring
 *   - greater_than: numeric comparison (answer > rule value)
 *   - less_than: numeric comparison (answer < rule value)
 *   - is_empty: true if the answer is null, undefined, or an empty string/array
 *   - is_not_empty: negation of is_empty
 *
 * Returns true if the rule's condition is satisfied.
 */
function evaluateCondition(
  operator: LogicOperator,
  answer: string | number | boolean | string[] | null | undefined,
  ruleValue: string | number | boolean | null
): boolean {
  switch (operator) {
    case "is_empty":
      return isEmptyValue(answer);

    case "is_not_empty":
      return !isEmptyValue(answer);

    case "equals":
      return evaluateEquals(answer, ruleValue);

    case "not_equals":
      return !evaluateEquals(answer, ruleValue);

    case "contains":
      return evaluateContains(answer, ruleValue);

    case "greater_than":
      return evaluateNumericComparison(answer, ruleValue, "gt");

    case "less_than":
      return evaluateNumericComparison(answer, ruleValue, "lt");

    default:
      return false;
  }
}

/**
 * Check if a value is considered "empty" in the context of form answers.
 */
function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * Evaluate equality between an answer and a rule value.
 * For arrays (multiple choice), checks if the rule value is included.
 * For other types, performs string-based comparison for consistent matching.
 */
function evaluateEquals(
  answer: string | number | boolean | string[] | null | undefined,
  ruleValue: string | number | boolean | null
): boolean {
  if (answer === null || answer === undefined) {
    return ruleValue === null;
  }

  if (Array.isArray(answer)) {
    // For array answers (multiple choice), check if the rule value is one of the selections
    return answer.some((item) => String(item) === String(ruleValue));
  }

  // For boolean answers, handle string representations
  if (typeof answer === "boolean") {
    if (typeof ruleValue === "boolean") return answer === ruleValue;
    if (typeof ruleValue === "string") {
      return answer === (ruleValue.toLowerCase() === "true" || ruleValue === "1" || ruleValue.toLowerCase() === "yes");
    }
  }

  return String(answer) === String(ruleValue);
}

/**
 * Evaluate if the answer contains the rule value as a substring.
 */
function evaluateContains(
  answer: string | number | boolean | string[] | null | undefined,
  ruleValue: string | number | boolean | null
): boolean {
  if (answer === null || answer === undefined || ruleValue === null) return false;

  const ruleStr = String(ruleValue).toLowerCase();

  if (Array.isArray(answer)) {
    // For arrays, check if any element contains the substring
    return answer.some((item) => String(item).toLowerCase().includes(ruleStr));
  }

  return String(answer).toLowerCase().includes(ruleStr);
}

/**
 * Evaluate a numeric comparison between the answer and rule value.
 */
function evaluateNumericComparison(
  answer: string | number | boolean | string[] | null | undefined,
  ruleValue: string | number | boolean | null,
  direction: "gt" | "lt"
): boolean {
  const answerNum = toNumber(answer);
  const ruleNum = toNumber(ruleValue);

  if (answerNum === null || ruleNum === null) return false;

  return direction === "gt" ? answerNum > ruleNum : answerNum < ruleNum;
}

/**
 * Safely convert a value to a number, returning null if not possible.
 */
function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return isNaN(value) ? null : value;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "string") {
    const num = Number(value);
    return isNaN(num) ? null : num;
  }
  return null;
}

/**
 * Determine the next question to show given the current question, its logic rules,
 * and the respondent's answers so far.
 *
 * Evaluation strategy:
 * 1. Check each logic rule in order for the current question.
 * 2. If a rule's condition matches the answer for the rule's target question, jump to its destination.
 * 3. If no rule matches, fall through to the next question by order_index.
 * 4. If there is no next question, return null (end of form).
 *
 * @param questions - All questions in the form, sorted by order_index.
 * @param currentQuestionId - The ID of the question the respondent just answered.
 * @param answers - A map of question IDs to their current answer values.
 * @returns The ID of the next question to display, or null if the form is complete.
 */
export function getNextQuestionId(
  questions: Question[],
  currentQuestionId: string,
  answers: AnswersMap
): string | null {
  const sorted = [...questions].sort((a, b) => a.order_index - b.order_index);
  const currentIndex = sorted.findIndex((q) => q.id === currentQuestionId);

  if (currentIndex === -1) return null;

  const currentQuestion = sorted[currentIndex];

  // Evaluate logic rules for the current question
  const rules = currentQuestion.logic_rules ?? [];
  for (const rule of rules) {
    // The rule checks the answer for its associated question_id (which may be the current question)
    const answerValue = answers[rule.question_id];

    if (evaluateCondition(rule.operator, answerValue, rule.value)) {
      // Verify the destination question exists in the form
      const destinationExists = sorted.some((q) => q.id === rule.destination_question_id);
      if (destinationExists) {
        return rule.destination_question_id;
      }
    }
  }

  // No logic rule matched: advance to the next question by order_index
  const nextIndex = currentIndex + 1;
  if (nextIndex >= sorted.length) return null;

  return sorted[nextIndex].id;
}

/**
 * Get the previous question ID based on order_index (ignoring logic).
 * Used for backwards navigation.
 */
export function getPreviousQuestionId(
  questions: Question[],
  currentQuestionId: string
): string | null {
  const sorted = [...questions].sort((a, b) => a.order_index - b.order_index);
  const currentIndex = sorted.findIndex((q) => q.id === currentQuestionId);

  if (currentIndex <= 0) return null;

  return sorted[currentIndex - 1].id;
}

/**
 * Calculate the progress percentage through the form.
 * Uses the current question's order_index relative to total questions.
 */
export function calculateProgress(
  questions: Question[],
  currentQuestionId: string
): number {
  if (questions.length === 0) return 0;

  const sorted = [...questions].sort((a, b) => a.order_index - b.order_index);
  const currentIndex = sorted.findIndex((q) => q.id === currentQuestionId);

  if (currentIndex === -1) return 0;

  // +1 because index is 0-based, and we consider the current question as "reached"
  return Math.round(((currentIndex + 1) / sorted.length) * 100);
}

/**
 * Validate that all logic rules in a form reference valid question IDs.
 * Returns an array of error messages, or an empty array if all rules are valid.
 */
export function validateLogicRules(questions: Question[]): string[] {
  const errors: string[] = [];
  const questionIds = new Set(questions.map((q) => q.id));

  for (const question of questions) {
    for (const rule of (question.logic_rules ?? [])) {
      if (!questionIds.has(rule.question_id)) {
        errors.push(
          `Rule "${rule.id}" on question "${question.title}" references non-existent source question "${rule.question_id}".`
        );
      }
      if (!questionIds.has(rule.destination_question_id)) {
        errors.push(
          `Rule "${rule.id}" on question "${question.title}" references non-existent destination question "${rule.destination_question_id}".`
        );
      }
    }
  }

  return errors;
}
