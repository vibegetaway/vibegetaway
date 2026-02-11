
// Maximum allowed length for search queries to prevent DoS and buffer overflows
export const MAX_QUERY_LENGTH = 500;

/**
 * Sanitizes the query string to prevent log injection and other injection attacks.
 * Removes newlines, carriage returns, and trims whitespace.
 * @param query The raw input query string
 * @returns Sanitized query string safe for logging and processing
 */
export function sanitizeQuery(query: string): string {
  if (!query) return '';
  // Replace newlines and carriage returns with a space to prevent log injection
  return query.replace(/[\n\r]/g, ' ').trim();
}

/**
 * Validates the query length against defined limits.
 * @param query The sanitized query string
 * @returns Object indicating validity and optional error message
 */
export function validateQuery(query: string): { isValid: boolean; error?: string } {
  if (!query) return { isValid: true };

  if (query.length > MAX_QUERY_LENGTH) {
    return {
      isValid: false,
      error: `Query too long. Max ${MAX_QUERY_LENGTH} characters.`
    };
  }

  return { isValid: true };
}
