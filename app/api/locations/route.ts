import { NextResponse } from 'next/server'
import { searchRedditWithPerplexity } from './perplexity-search'

// Allow up to 120 seconds for Perplexity search with structured output
export const maxDuration = 120

async function fetchPixabayImage(spot: string, location: string): Promise<string> {
  try {
    // Use the most specific search term as the cache key
    // The cached-images endpoint will handle the Pixabay API call and fallback logic
    const keywords = `${spot} ${location}`.trim()
    
    // Route through caching proxy which uses keywords as cache key
    // This ensures consistent caching even if Pixabay URLs expire
    const proxiedUrl = `/api/images/cached-images?keywords=${encodeURIComponent(keywords)}`
    return proxiedUrl
  } catch (error) {
    console.error(`Error generating cached image URL for ${spot}:`, error)
    return '/assets/icon-512.png'
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

    const MAX_QUERY_LENGTH = 500
    const sanitizedQuery = query.slice(0, MAX_QUERY_LENGTH).replace(/[\n\r]/g, ' ').trim()

    console.log(`[Locations API] Processing query: "${sanitizedQuery}"`)

    // Step 1: Search Reddit using Perplexity with structured output
    const startTime = Date.now()
    const locations = await searchRedditWithPerplexity(sanitizedQuery)
    const perplexityDuration = Date.now() - startTime
    console.log(`[Locations API] Perplexity search completed in ${perplexityDuration}ms, found ${locations.length} locations`)

    if (locations.length === 0) {
      console.log('[Locations API] No locations found, returning empty array')
      return NextResponse.json({ locations: [] })
    }

    // Step 2: Sort by prominence score (Perplexity already filtered and validated)
    locations.sort((a, b) => b.prominence_score - a.prominence_score)
    console.log(`[Locations API] Sorted ${locations.length} locations by prominence score`)

    // Step 3: Fetch images for each location in parallel
    console.log('[Locations API] Fetching images...')
    const imageStartTime = Date.now()
    const locationsWithImages = await Promise.all(
      locations.map(async (loc) => {
        const freshImageUrl = await fetchPixabayImage(loc.spot, loc.location)
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
