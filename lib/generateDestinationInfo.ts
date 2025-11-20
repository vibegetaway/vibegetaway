'use server'

import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { groq } from '@ai-sdk/groq'


export interface DestinationPricing {
  accommodation: string
  food: string
  activities: string
}

export interface UnsplashImage {
  id: string
  urls: {
    small: string
    regular: string
    full: string
  }
  altDescription: string
}

export interface ImageKeywords {
  cover?: string
  gallery?: string
}

export interface Destination {
  country: string
  region?: string
  description?: string[]
  imagesKeywords?: ImageKeywords
  pricing?: DestinationPricing
  recommendedDuration?: string
  destinationAirportCode?: string
}

export interface GenerateDestinationParams {
  vibe: string
  timePeriod: string
  price?: string // Keep for backward compatibility or simple string input
  from?: string // Origin
  // New filters
  destinations?: string[] // Specific regions/countries to filter by
  duration?: [number, number] // Min/max days
  budget?: number // Numeric budget cap
  exclusions?: string[] // Things to avoid
  styles?: string[] // Travel styles
}

// Helper function to strip markdown code fences from JSON responses (```json, ```JSON, or just ```)
function stripMarkdownFences(text: string): string {
  let cleaned = text.trim()
  cleaned = cleaned.replace(/^```(?:json|JSON)?\n?/, '')
  cleaned = cleaned.replace(/\n?```$/, '')
  return cleaned.trim()
}

const DESTINATION_NAMES_SYSTEM_PROMPT = `
You are a travel destination expert. Analyze free-form text about travel preferences and generate the 10 most suitable destinations ranked by relevance.

Parse for: activities/interests, timing/season, budget, travel style, climate/geography preferences.

CRITICAL INSTRUCTION FOR DESTINATION GRANULARITY:
1. IF the user specifies a broad destination area (e.g. "Bali", "Thailand", "California"):
   - You MUST recommend specific, granular locations within that area (e.g. "Uluwatu", "Canggu", "Ubud" for Bali).
   - Do NOT just return the broad area again.
2. IF the user DOES NOT specify a destination area:
   - Recommend a mix of broad regions (e.g. "Algarve, Portugal") and specific famous spots.
   - Ensure diversity across countries unless constrained by other factors.

For each destination provide ONLY:
1. Country (ISO 3166-1 alpha-3 code)
2. Region/city name (the specific destination within that country)

Format STRICTLY as JSON array:

[
  {
    "country": "JPN",
    "region": "Tokyo"
  },
  {
    "country": "THA", 
    "region": "Chiang Mai"
  }
]

Output ONLY valid JSON—no preamble or additional text. Return exactly 10 destinations in descending order of relevance to the user's preferences.
`

const DESTINATION_DETAIL_SYSTEM_PROMPT = `
You are a travel destination expert. Provide detailed information about specific destinations based on the user's travel preferences.

Parse for: activities/interests, timing/season, budget, travel style, climate/geography preferences.

For EACH destination provided, generate detailed information:
1. Country (ISO 3166-1 alpha-3 code) - must match the provided country
2. Region/city name - must match the provided region
3. Description with 4-6 bullet points covering:
   - Why it matches their specific interests and activities. Focus on what they want to do, not generic tourist information.
   - Seasonal suitability and timing for their travel period
   - Use markdown formatting for bullet points with emojis
4. Image keywords object with:
   - cover: 2-3 keywords for the country and region (e.g., "japan tokyo")
   - gallery: 3-5 keywords that describe the destination, region and activities the user wants to do (e.g., "tokyo street food sushi ramen shibuya")
5. Price estimates (in USD per day):
   - Accommodation (budget/mid-range/luxury range, e.g., "20-40")
   - Food (typical daily cost, e.g., "15-30")
   - Activities (cost for their specific interests, e.g., "30-50")
6. Recommended duration (in days as string, e.g., "7")
7. Airport code for the main international airport in the destination region or country (IATA code, e.g., "HND" for Tokyo)

Format STRICTLY as a JSON array with one object per destination:

[
  {
    "country": "JPN",
    "region": "Tokyo",
    "description": [
      "✨ **Perfect for Adventure**: Tokyo offers incredible hiking trails within 2 hours of the city",
      "🏔️ **Mountain Access**: Easy access to Mount Takao and the Japanese Alps",
      "🍜 **Food Scene**: Amazing post-hike ramen and local cuisine",
      "🌸 **November Weather**: Crisp autumn weather perfect for outdoor activities",
      "🚇 **Easy Navigation**: Excellent public transport to trailheads"
    ],
    "imagesKeywords": {
      "cover": "japan tokyo mountains",
      "gallery": "tokyo hiking mount takao autumn trails japanese alps"
    },
    "pricing": {
      "accommodation": "30-60",
      "food": "20-35",
      "activities": "25-45"
    },
    "recommendedDuration": "7",
    "destinationAirportCode": "NRT"
  }
]

Output ONLY valid JSON array—no preamble or additional text. Return exactly one object per requested destination in the same order.
`

export async function generateDestinationNames(
  params: GenerateDestinationParams
): Promise<Destination[]> {
  try {
    const {
      vibe,
      timePeriod,
      price,
      from,
      destinations: filterDestinations,
      duration,
      budget,
      exclusions,
      styles
    } = params

    if (!vibe || vibe.trim().length === 0) {
      throw new Error('Vibe is required')
    }
    if (!timePeriod || timePeriod.trim().length === 0) {
      throw new Error('Time period is required')
    }

    // Build a natural language prompt from structured parameters
    let prompt = `I want to ${vibe} in ${timePeriod}.`

    if (from) {
      prompt += ` I'm traveling from ${from}.`
    }

    // Handle Budget (support both legacy string and new number)
    if (budget && budget < 2000) {
      prompt += ` My daily budget is under $${budget}.`
    } else if (price) {
      prompt += ` My budget is ${price}.`
    }

    // Handle Duration
    if (duration) {
      prompt += ` I plan to stay for ${duration[0]} to ${duration[1]} days.`
    }

    // Handle Specific Destinations (Filter)
    if (filterDestinations && filterDestinations.length > 0) {
      prompt += ` I am specifically interested in going to: ${filterDestinations.join(', ')}. Please suggest specific places within these areas.`
    }

    // Handle Exclusions
    if (exclusions && exclusions.length > 0) {
      prompt += ` I want to AVOID: ${exclusions.join(', ')}.`
    }

    // Handle Travel Styles
    if (styles && styles.length > 0) {
      prompt += ` My travel style is: ${styles.join(', ')}.`
    }

    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      system: DESTINATION_NAMES_SYSTEM_PROMPT,
      prompt: prompt,
    })

    // Strip markdown fences if present, then parse the JSON response
    const cleanedText = stripMarkdownFences(text)
    const destinations: Destination[] = JSON.parse(cleanedText)

    return destinations
  } catch (error) {
    console.error('Error generating destination names:', error)
    throw new Error(
      error instanceof Error
        ? `Failed to generate destination names: ${error.message}`
        : 'Failed to generate destination names'
    )
  }
}

/**
 * Generate detailed information for MULTIPLE destinations in a single LLM call
 */
export async function generateDestinationInfo(
  destinations: Array<{ country: string; region: string }>,
  params: GenerateDestinationParams
): Promise<Destination[]> {
  try {
    const { vibe, timePeriod, price, from } = params

    if (!vibe || vibe.trim().length === 0) {
      throw new Error('Vibe is required')
    }
    if (!timePeriod || timePeriod.trim().length === 0) {
      throw new Error('Time period is required')
    }
    if (!destinations || destinations.length === 0) {
      throw new Error('At least one destination is required')
    }

    // Build a natural language prompt from structured parameters
    let prompt = `I want to ${vibe} in ${timePeriod}.`

    if (from) {
      prompt += ` I'm traveling from ${from}.`
    }

    // Handle Budget
    if (params.budget && params.budget < 2000) {
      prompt += ` My daily budget is under $${params.budget}.`
    } else if (price) {
      prompt += ` My budget is ${price}.`
    }

    // Handle Duration
    if (params.duration) {
      prompt += ` I plan to stay for ${params.duration[0]} to ${params.duration[1]} days.`
    }

    // Handle Exclusions
    if (params.exclusions && params.exclusions.length > 0) {
      prompt += ` I want to AVOID: ${params.exclusions.join(', ')}.`
    }

    // Handle Travel Styles
    if (params.styles && params.styles.length > 0) {
      prompt += ` My travel style is: ${params.styles.join(', ')}.`
    }

    // List all destinations in the prompt
    prompt += `\n\nProvide detailed information for the following ${destinations.length} destinations:\n`
    destinations.forEach((dest, index) => {
      prompt += `${index + 1}. ${dest.region}, ${dest.country}\n`
    })

    console.log(`[SERVER] Making single LLM call for ${destinations.length} destinations`)

    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      system: DESTINATION_DETAIL_SYSTEM_PROMPT,
      prompt: prompt,
    })

    // Strip markdown fences if present, then parse the JSON response
    const cleanedText = stripMarkdownFences(text)
    const detailedDestinations: Destination[] = JSON.parse(cleanedText)

    console.log(`[SERVER] LLM returned ${detailedDestinations.length} destinations`)

    return detailedDestinations
  } catch (error) {
    console.error('Error generating destination info:', error)
    throw new Error(
      error instanceof Error
        ? `Failed to generate destination info: ${error.message}`
        : 'Failed to generate destination info'
    )
  }
}

export async function fetchUnsplashImages(
  keywords: string,
  limit: number = 10
): Promise<UnsplashImage[]> {
  try {
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

    if (!UNSPLASH_ACCESS_KEY) {
      console.error('UNSPLASH_ACCESS_KEY environment variable is not set')
      return []
    }

    if (!keywords || keywords.trim().length === 0) {
      console.warn('No keywords provided for Unsplash search')
      return []
    }

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keywords)}&per_page=${limit}`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    })

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return data.results.map((photo: any) => ({
      id: photo.id,
      urls: {
        small: photo.urls.small,
        regular: photo.urls.regular,
        full: photo.urls.full
      },
      altDescription: photo.alt_description || 'Destination image'
    }))
  } catch (error) {
    console.error('Error fetching Unsplash images:', error)
    return []
  }
}

