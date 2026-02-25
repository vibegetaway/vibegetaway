export const MAX_SUGGESTION_INPUT_LENGTH = 100;
export const MAX_SUGGESTION_CONTEXT_LENGTH = 500;
export const ALLOWED_SUGGESTION_TYPES = ['vibe', 'location', 'event', 'exclusion'] as const;

export type SuggestionType = typeof ALLOWED_SUGGESTION_TYPES[number];
