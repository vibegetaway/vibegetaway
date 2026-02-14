export const MAX_QUERY_LENGTH = 500;

/**
 * Validates and sanitizes the user query.
 *
 * @param query - The user search query string.
 * @returns The sanitized query string.
 * @throws Error if the query length exceeds MAX_QUERY_LENGTH.
 */
export function validateAndSanitizeQuery(query: string | null): string {
  if (!query) {
    return '';
  }

  // Remove newlines and carriage returns to prevent log injection
  const sanitized = query.replace(/[\n\r]/g, ' ').trim();

  if (sanitized.length > MAX_QUERY_LENGTH) {
    throw new Error(`Query too long (max ${MAX_QUERY_LENGTH} chars)`);
  }

  return sanitized;
}
