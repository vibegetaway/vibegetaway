// Security constants for input validation
export const MAX_SUGGESTION_INPUT_LENGTH = 100
export const MAX_SUGGESTION_CONTEXT_LENGTH = 500
export const MAX_SEARCH_QUERY_LENGTH = 100

// Whitelist for suggestion types
export const ALLOWED_SUGGESTION_TYPES = ['event', 'exclusion', 'location', 'vibe'] as const
export type SuggestionType = typeof ALLOWED_SUGGESTION_TYPES[number]
