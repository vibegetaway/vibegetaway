export const MAX_QUERY_LENGTH = 500

/**
 * Validates and sanitizes the search query for locations API.
 *
 * @param input - The raw query string from URL search params
 * @returns The sanitized query string
 * @throws Error if the query is too long
 */
export function validateSearchQuery(input: string | null): string {
  // 1. Handle null/undefined as empty string
  if (!input) {
    return ''
  }

  // 2. Check length BEFORE other processing to fail fast
  if (input.length > MAX_QUERY_LENGTH) {
    throw new Error(`Query too long (max ${MAX_QUERY_LENGTH} chars)`)
  }

  // 3. Sanitize: Remove newlines and carriage returns to prevent log injection
  //    and potential prompt injection issues.
  //    Also trim whitespace.
  const sanitized = input.replace(/[\n\r]/g, ' ').trim()

  return sanitized
}
