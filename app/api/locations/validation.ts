export const MAX_QUERY_LENGTH = 500

/**
 * Sanitizes user input to prevent log injection and other string-based attacks.
 * Replaces newlines and carriage returns with spaces.
 */
export function sanitizeInput(str: string): string {
  return str.replace(/[\n\r]+/g, ' ').trim()
}

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validates the search query against security constraints.
 */
export function validateQuery(query: string): ValidationResult {
  if (query.length > MAX_QUERY_LENGTH) {
    return {
      isValid: false,
      error: `Query must be less than ${MAX_QUERY_LENGTH} characters`
    }
  }
  return { isValid: true }
}
