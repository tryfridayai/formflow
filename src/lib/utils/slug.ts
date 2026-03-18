/**
 * Generate a URL-friendly slug from a title string with a random suffix.
 * The suffix ensures uniqueness without needing a database check.
 *
 * Example: "My Cool Form!" -> "my-cool-form-a1b2c3"
 */
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  const suffix = generateRandomSuffix(6);

  if (!base) {
    return suffix;
  }

  return `${base}-${suffix}`;
}

/**
 * Generate a random alphanumeric string of the given length.
 */
function generateRandomSuffix(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

/**
 * Validate that a slug is well-formed.
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
