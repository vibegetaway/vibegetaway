export function cleanKeywords(keywords: string | string[] | null): string {
  if (!keywords) return ''
  return Array.isArray(keywords)
    ? keywords.filter(k => k && k.trim().length > 0).join(' ')
    : keywords
}

export function getFallbackSearchTerms(keywordString: string): string[] {
  if (!keywordString || keywordString.trim().length === 0) return []

  return [
    keywordString, // Original search
    keywordString.split(' ').slice(0, 2).join(' '), // First 2 words
    keywordString.split(' ')[0], // First word only
    'travel destination' // Ultimate fallback
  ]
}
