/**
 * Normalizes form theme from DB JSONB to consistent property names.
 * Handles both camelCase (our DB) and snake_case (some components expect).
 */
export interface NormalizedTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  backgroundImage: string | null;
  darkMode: boolean;
  borderRadius: string;
}

export function normalizeTheme(theme: unknown): NormalizedTheme {
  const t = (theme ?? {}) as Record<string, unknown>;
  return {
    primaryColor: (t.primaryColor ?? t.primary_color ?? t.button_color ?? '#6366f1') as string,
    backgroundColor: (t.backgroundColor ?? t.background_color ?? '#ffffff') as string,
    textColor: (t.textColor ?? t.text_color ?? t.question_color ?? '#111827') as string,
    fontFamily: (t.fontFamily ?? t.font_family ?? 'Inter') as string,
    backgroundImage: (t.backgroundImage ?? t.background_image ?? t.background_image_url ?? null) as string | null,
    darkMode: (t.darkMode ?? t.dark_mode ?? false) as boolean,
    borderRadius: (t.borderRadius ?? t.border_radius ?? 'md') as string,
  };
}
