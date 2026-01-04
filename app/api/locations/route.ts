import { NextResponse } from 'next/server'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createGroq } from '@ai-sdk/groq'
import { generateText } from 'ai'
import { searchRedditWithExa } from './exa-search'

interface Location {
  location: string      // City/area
  logical_location: string  // Logical grouping (e.g., Bali)
  spot: string         // Specific landmark
  country: string
  latitude: number
  longitude: number
  activity: string
  description: string
  price_class: string
  prominence_score: number
  tags: string
  image_url: string
}

// Allow up to 120 seconds for Exa search + LLM processing
export const maxDuration = 120

const SYSTEM_PROMPT = `You are a travel destination generator that analyzes Reddit recommendations.

Given Reddit discussions about travel destinations, extract and generate a list of specific travel locations with accurate geographic coordinates.

For each destination, provide:
- location: City/area name (e.g., "Seminyak", "Ubud")
- logical_location: Broader region travelers recognize (e.g., "Bali", "Tuscany")
- spot: Specific landmark/attraction name (e.g., "Tanah Lot Temple", "Tegallalang Rice Terraces")
- country: Full country name
- latitude: Accurate decimal latitude
- longitude: Accurate decimal longitude
- activity: What to do there (e.g., "temple visit", "beach relaxation", "hiking")
- description: 1-2 sentence compelling description
- price_class: $ (budget), $$ (moderate), $$$ (upscale), $$$$ (luxury), $$$$$ (ultra-luxury)
- prominence_score: 1-10 based on Reddit mention frequency, enthusiasm, and upvotes
- tags: Comma-separated descriptive tags (e.g., "beach,surfing,sunset,romantic")

IMPORTANT INSTRUCTIONS:
1. Base prominence_score on how frequently and enthusiastically the destination is mentioned in the Reddit discussions
2. Include diverse destinations - mix popular spots with hidden gems mentioned by locals
3. Ensure coordinates are accurate - use your knowledge of real geographic locations
4. Make descriptions engaging and specific, not generic
5. Generate AS MANY relevant destinations as you can based on the Reddit discussions - don't limit yourself
6. If a destination is mentioned multiple times across posts, give it a higher prominence_score
7. Include both explicitly mentioned destinations and related destinations that would interest the same audience

Return ONLY a valid JSON array of location objects. No markdown formatting, no explanation text, no code blocks - just the raw JSON array.`

async function fetchPixabayImage(spot: string, location: string, tags: string): Promise<string> {
  try {
    // Use the most specific search term as the cache key
    // The cached-images endpoint will handle the Pixabay API call and fallback logic
    const keywords = `${spot} ${location}`.trim()
    
    // Route through caching proxy which uses keywords as cache key
    // This ensures consistent caching even if Pixabay URLs expire
    const proxiedUrl = `/api/cached-images?keywords=${encodeURIComponent(keywords)}`
    return proxiedUrl
  } catch (error) {
    console.error(`Error generating cached image URL for ${spot}:`, error)
    return '/assets/icon-512.png'
  }
}

function stripMarkdownFences(text: string): string {
  // Remove markdown code fences if present
  return text.replace(/^```(?:json)?\s*\n?/gm, '').replace(/\n?```\s*$/gm, '').trim()
}

async function filterLocationsByQuery(locations: Location[], originalQuery: string, model: any): Promise<Location[]> {
  if (locations.length === 0) return []
  
  try {
    const filterPrompt = `Given the user's original search query: "${originalQuery}"

Analyze these destinations and determine which ones are truly relevant to the query.
A destination is relevant if it matches the query's:
- Geographic intent (location, country, region)
- Activity/theme intent (beach, temple, hiking, etc.)
- Vibe/style intent (budget, luxury, romantic, adventure, etc.)

Be strict - if a destination doesn't clearly match the query intent, exclude it.

Destinations to evaluate:
${locations.map((loc, i) => `${i}. ${loc.spot} in ${loc.location}, ${loc.country} - ${loc.activity} - ${loc.description}`).join('\n')}

Return ONLY a JSON array of indices (numbers) for the relevant destinations. Example: [0, 2, 5, 7]
Return [] if none are relevant.`

    const { text } = await generateText({
      model,
      prompt: filterPrompt,
      temperature: 0.1,
    })
    
    const cleanedText = stripMarkdownFences(text)
    const relevantIndices = JSON.parse(cleanedText) as number[]
    
    console.log(`[Locations API] Query filter kept ${relevantIndices.length}/${locations.length} locations`)
    
    return relevantIndices
      .filter(idx => idx >= 0 && idx < locations.length)
      .map(idx => locations[idx])
  } catch (error) {
    console.error('[Locations API] Error filtering locations by query:', error)
    // On error, return all locations (fail open)
    return locations
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    // If no query, return empty array (user hasn't searched yet)
    if (!query.trim()) {
      console.log('[Locations API] No query provided, returning empty array')
      return NextResponse.json({ locations: [] })
    }

    console.log(`[Locations API] Processing query: "${query}"`)

    // Step 1: Search Reddit using Exa
    const startTime = Date.now()
    const redditPosts = await searchRedditWithExa(query)
    const exaDuration = Date.now() - startTime
    console.log(`[Locations API] Exa search completed in ${exaDuration}ms, found ${redditPosts.length} posts`)

    if (redditPosts.length === 0) {
      console.log('[Locations API] No Reddit posts found, returning empty array')
      return NextResponse.json({ locations: [] })
    }

    // Step 2: Prepare Reddit content for LLM
    // Limit text length to avoid token limits (max ~2000 chars per post)
    const redditContent = redditPosts.map((post, i) => {
      const textPreview = post.text.slice(0, 2000)
      return `=== Reddit Post ${i + 1}: ${post.title} ===
URL: ${post.url}
${textPreview}${post.text.length > 2000 ? '...' : ''}`
    }).join('\n\n')

    const userPrompt = `Reddit discussions about "${query}":

${redditContent}

Based on these Reddit recommendations, generate as many specific travel destinations as possible with accurate coordinates. Include all destinations mentioned directly, plus related destinations that would interest the same audience. Focus on variety and comprehensive coverage. Prioritize destinations with higher mention frequency and enthusiasm.`

    // Step 3: Generate destinations using LLM
    console.log('[Locations API] Calling LLM to generate destinations...')
    
    // Prefer Gemini for geographic accuracy
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    })
    
    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    })

    // Use Gemini 2.5 Flash for best geographic knowledge, fallback to Groq
    const model = process.env.GOOGLE_GENERATIVE_AI_API_KEY
      ? google('gemini-2.5-flash')
      : groq('llama-3.3-70b-versatile')

    const llmStartTime = Date.now()
    const { text } = await generateText({
      model,
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.3, // Lower temperature for more consistent/accurate coordinates
    })
    const llmDuration = Date.now() - llmStartTime
    console.log(`[Locations API] LLM generation completed in ${llmDuration}ms`)

    // Step 4: Parse LLM response
    const cleanedText = stripMarkdownFences(text)
    let parsedLocations: Location[] = []
    
    try {
      parsedLocations = JSON.parse(cleanedText)
      console.log(`[Locations API] Successfully parsed ${parsedLocations.length} locations`)
    } catch (parseError) {
      console.error('[Locations API] Failed to parse LLM response:', parseError)
      console.error('[Locations API] Raw response:', cleanedText.slice(0, 500))
      return NextResponse.json({ 
        error: 'Failed to generate destinations',
        locations: [] 
      })
    }

    // Step 5: Validate and filter locations
    const validLocations = parsedLocations.filter(loc => 
      loc.latitude && 
      loc.longitude && 
      !isNaN(loc.latitude) && 
      !isNaN(loc.longitude) &&
      loc.spot &&
      loc.country
    )

    console.log(`[Locations API] ${validLocations.length} valid locations after basic filtering`)

    // Step 5b: Filter locations to match original query intent
    const relevantLocations = await filterLocationsByQuery(validLocations, query, model)
    console.log(`[Locations API] ${relevantLocations.length} relevant locations after query filtering`)

    // Step 6: Sort by prominence score (no limit - return all)
    relevantLocations.sort((a, b) => b.prominence_score - a.prominence_score)

    // Step 7: Fetch images for each location in parallel
    console.log('[Locations API] Fetching images...')
    const imageStartTime = Date.now()
    const locationsWithImages = await Promise.all(
      relevantLocations.map(async (loc) => {
        const freshImageUrl = await fetchPixabayImage(loc.spot, loc.location, loc.tags)
        return {
          ...loc,
          image_url: freshImageUrl
        }
      })
    )
    const imageDuration = Date.now() - imageStartTime
    console.log(`[Locations API] Image fetching completed in ${imageDuration}ms`)

    const totalDuration = Date.now() - startTime
    console.log(`[Locations API] Total request duration: ${totalDuration}ms`)
    console.log(`[Locations API] Returning ${locationsWithImages.length} locations`)

    return NextResponse.json({ locations: locationsWithImages })
  } catch (error) {
    console.error('[Locations API] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      locations: [] 
    }, { status: 500 })
  }
}
