import Exa from 'exa-js'
import { createGroq } from '@ai-sdk/groq'
import { generateText } from 'ai'

export interface ExaResult {
  url: string
  title: string
  text: string
  highlights?: string[]
}

/**
 * Use Groq to construct an optimized search query for Exa
 * @param userQuery - Raw user search query
 * @returns Optimized search query for finding Reddit travel recommendations
 */
async function constructSearchQuery(userQuery: string): Promise<string> {
  try {
    const groqApiKey = process.env.GROQ_API_KEY
    
    if (!groqApiKey) {
      console.warn('[Exa] GROQ_API_KEY not set, falling back to template')
      return `best ${userQuery} travel destinations recommendations where to go`
    }

    const groq = createGroq({
      apiKey: groqApiKey,
    })

    const systemPrompt = `You are a search query optimization expert for Reddit travel discussions.

Your job is to transform a user's travel search query into an optimal search query for finding relevant Reddit posts about travel destinations.

Guidelines:
- Keep queries concise and focused (under 15 words)
- Include terms like "travel", "destination", "recommendations", "visit" when appropriate
- Preserve specific location names, activities, or themes from the user query
- Remove redundant words or phrases
- Make the query sound natural for Reddit discussions
- Focus on finding traveler recommendations and experiences

Return ONLY the optimized search query, nothing else.`

    const userPrompt = `User search query: "${userQuery}"

Generate an optimized search query for finding Reddit travel recommendations.`

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.3,
    })

    const optimizedQuery = text.trim().replace(/^["']|["']$/g, '') // Remove quotes if present
    console.log(`[Exa] Groq optimized query: "${userQuery}" → "${optimizedQuery}"`)
    return optimizedQuery

  } catch (error) {
    console.error('[Exa] Error constructing search query with Groq:', error)
    // Fallback to template-based query
    return `best ${userQuery} travel destinations recommendations where to go`
  }
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
    
    // Use Groq to construct an optimized search query
    const searchQuery = await constructSearchQuery(query)
    
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

