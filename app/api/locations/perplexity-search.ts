export interface Location {
  location: string      // City/area
  spot: string         // Specific landmark
  country: string
  latitude: number
  longitude: number
  description: string
  price_class: string
  prominence_score: number
  reddit_source_urls: string[]  // URLs of Reddit posts that mentioned this destination
}

/**
 * Search Reddit for travel destination recommendations using Perplexity API
 * @param query - User's search query (e.g., "beaches", "temples in asia")
 * @returns Array of Location objects with geographic and travel data
 */
export async function searchRedditWithPerplexity(query: string): Promise<Location[]> {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY
    
    if (!apiKey) {
      console.error('PERPLEXITY_API_KEY environment variable is not set')
      return []
    }

    // Sanitize query for logging to prevent log injection
    const sanitizedQuery = query.replace(/[\n\r]/g, ' ')
    console.log(`[Perplexity] Searching Reddit for travel destinations: "${sanitizedQuery}"`)
    
    // Define JSON schema for structured output
    const responseSchema = {
      type: "object",
      properties: {
        locations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              location: { type: "string", description: "City/area name (e.g., 'Seminyak', 'Ubud')" },
              spot: { type: "string", description: "Specific landmark/attraction name" },
              country: { type: "string", description: "Full country name" },
              latitude: { type: "number", description: "Accurate decimal latitude" },
              longitude: { type: "number", description: "Accurate decimal longitude" },
              description: { type: "string", description: "1-2 sentence compelling description" },
              price_class: { type: "string", enum: ["$", "$$", "$$$", "$$$$", "$$$$$"], description: "Price range" },
              prominence_score: { type: "number", minimum: 1, maximum: 10, description: "Score based on Reddit mention frequency and enthusiasm" },
              reddit_source_urls: { type: "array", items: { type: "string" }, description: "URLs of Reddit posts that mentioned this" }
            },
            required: ["location", "spot", "country", "latitude", "longitude", "description", "price_class", "prominence_score", "reddit_source_urls"]
          }
        }
      },
      required: ["locations"]
    }

    // Call Perplexity API with structured output format
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: `You are a travel destination expert that analyzes Reddit travel discussions and extracts specific destinations.

Search Reddit for travel recommendations related to the user's query. Focus on posts from r/travel, r/solotravel, r/backpacking, and other travel subreddits.

For each destination mentioned in Reddit discussions, provide:
- City/area name and specific landmark/attraction name
- Full country name
- Accurate geographic coordinates (latitude/longitude)
- Compelling 1-2 sentence description highlighting what makes it special
- Price range based on Reddit discussions ($ to $$$$$)
- Prominence score (1-10) based on how frequently and enthusiastically it's mentioned
- URLs of the Reddit posts that mentioned this destination

IMPORTANT:
1. Base prominence_score on mention frequency and enthusiasm in Reddit discussions
2. Include diverse destinations - mix popular spots with hidden gems
3. Ensure coordinates are accurate for real locations
4. Generate AS MANY relevant destinations as possible (aim for 10-30)
5. Include both explicitly mentioned destinations and related ones that would interest the same audience
6. Make descriptions engaging and specific, not generic`
          },
          {
            role: 'user',
            content: `Find travel destinations related to: "${query}". Search Reddit discussions and extract specific locations with all required details including coordinates, activities, descriptions, and source URLs.`
          }
        ],
        max_tokens: 8000,
        temperature: 0.3,
        search_domain_filter: ['reddit.com'],
        return_citations: true,
        search_recency_filter: 'month',
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'travel_destinations',
            schema: responseSchema,
            strict: true
          }
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Perplexity] API error: ${response.status} - ${errorText}`)
      return []
    }

    const data = await response.json()
    
    console.log(`[Perplexity] Received structured response from Perplexity API`)
    
    // Extract locations from structured response
    const content = data.choices?.[0]?.message?.content || '{}'
    let parsedData: { locations: Location[] }
    
    try {
      parsedData = JSON.parse(content)
    } catch (parseError) {
      console.error('[Perplexity] Failed to parse JSON response:', parseError)
      console.error('[Perplexity] Raw content:', content.slice(0, 500))
      return []
    }
    
    const locations = parsedData.locations || []
    console.log(`[Perplexity] Extracted ${locations.length} locations from Reddit discussions`)
    
    // Validate locations have required fields
    const validLocations = locations.filter(loc => 
      loc.latitude && 
      loc.longitude && 
      !isNaN(loc.latitude) && 
      !isNaN(loc.longitude) &&
      loc.spot &&
      loc.country &&
      loc.location
    )
    
    console.log(`[Perplexity] ${validLocations.length} valid locations after validation`)
    
    // Log sample for debugging
    if (validLocations.length > 0) {
      console.log(`[Perplexity] Sample location:`, JSON.stringify(validLocations[0], null, 2))
    }
    
    return validLocations
  } catch (error) {
    console.error('Error searching Reddit with Perplexity:', error)
    return []
  }
}

