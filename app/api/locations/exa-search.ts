import Exa from 'exa-js'

export interface ExaResult {
  url: string
  title: string
  text: string
  highlights?: string[]
}

/**
 * Search Reddit for travel destination recommendations using Exa API
 * @param query - User's search query (e.g., "beaches", "temples in asia")
 * @returns Array of Reddit posts with full text content
 */
export async function searchRedditWithExa(query: string): Promise<ExaResult[]> {
  try {
    const apiKey = process.env.EXA_API_KEY
    
    if (!apiKey) {
      console.error('EXA_API_KEY environment variable is not set')
      return []
    }

    const exa = new Exa(apiKey)
    
    // Construct a search query optimized for finding travel recommendations on Reddit
    const searchQuery = `best ${query} travel destinations recommendations where to go`
    
    console.log(`[Exa] Searching Reddit for: "${searchQuery}"`)
    
    // Search Reddit with full text content
    const results = await exa.searchAndContents(searchQuery, {
      includeDomains: ['reddit.com'],
      numResults: 10,
      text: true,
      highlights: true,
      category: 'company' // Use 'company' category for better reddit results
    })
    
    console.log(`[Exa] Found ${results.results.length} Reddit posts`)
    
    // Map results to our interface
    return results.results.map(result => ({
      url: result.url,
      title: result.title || '',
      text: result.text || '',
      highlights: result.highlights || []
    }))
  } catch (error) {
    console.error('Error searching Reddit with Exa:', error)
    return []
  }
}

