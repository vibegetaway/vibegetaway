
export const MAX_QUERY_LENGTH = 500

export function validateSearchQuery(input: string | null): string {
  // 1. Handle null/undefined input as empty string
  const query = input || ''

  // 2. Check length
  if (query.length > MAX_QUERY_LENGTH) {
    throw new Error(`Query too long (max ${MAX_QUERY_LENGTH} chars)`)
  }

  // 3. Sanitize: replace newlines with space and trim
  return query.replace(/[\n\r]/g, ' ').trim()
}
