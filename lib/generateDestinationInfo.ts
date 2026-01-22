'use server'

import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { groq } from '@ai-sdk/groq'
import { Destination, GenerateDestinationParams } from '@/types/destination'
import { stripMarkdownFences } from './utils'
import { DESTINATION_NAMES_SYSTEM_PROMPT, DESTINATION_DETAIL_SYSTEM_PROMPT } from './constants'

// Re-export types for compatibility with existing imports
export type { Destination, DestinationPricing, ImageKeywords, GenerateDestinationParams } from '@/types/destination'

// Rate limiting for LocationIQ (2 requests/sec)
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 600

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function getCoordinates(location: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const apiKey = process.env.LOCATIONIQ_API_KEY
    console.log(`[getCoordinates] API Key present: ${!!apiKey}, Length: ${apiKey?.length || 0}`)

    if (!apiKey) {
      console.warn('[getCoordinates] LOCATIONIQ_API_KEY is not set')
      return null
    }

    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestTime
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest
      console.log(`[getCoordinates] Rate limiting: waiting ${waitTime}ms before request`)
      await delay(waitTime)
    }
    lastRequestTime = Date.now()

    const url = `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(location)}&format=json&limit=1`
    console.log(`[getCoordinates] Fetching: ${url.replace(apiKey, 'REDACTED')}`)

    const response = await fetch(url)
    console.log(`[getCoordinates] Response status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[getCoordinates] LocationIQ API error: ${response.status} ${response.statusText}`, errorText)
      return null
    }

    const data = await response.json()
    console.log(`[getCoordinates] Response data:`, data)

    if (!data || data.length === 0) {
      console.warn(`[getCoordinates] Geocoding failed for "${location}": No results`, data)
      return null
    }

    const { lat, lon } = data[0]
    console.log(`[getCoordinates] Success! Coords for "${location}": [${lon}, ${lat}]`)
    return { lat: parseFloat(lat), lng: parseFloat(lon) }
  } catch (error) {
    console.error(`[getCoordinates] Error geocoding "${location}":`, error)
    return null
  }
}

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

    const period = timePeriod && timePeriod.trim().length > 0 ? timePeriod : 'Anytime'
    let prompt = `I want to ${vibe} in ${period}.`

    if (from) {
      prompt += ` I'm traveling from ${from}.`
    }

    if (budget && budget < 2000) {
      prompt += ` My daily budget is under $${budget}.`
    } else if (price) {
      prompt += ` My budget is ${price}.`
    }

    if (duration) {
      prompt += ` I plan to stay for ${duration[0]} to ${duration[1]} days.`
    }

    if (filterDestinations && filterDestinations.length > 0) {
      prompt += ` I am specifically interested in going to: ${filterDestinations.join(', ')}. Please suggest specific places within these areas.`
    }

    if (exclusions && exclusions.length > 0) {
      prompt += ` I want to AVOID: ${exclusions.join(', ')}.`
    }

    if (styles && styles.length > 0) {
      prompt += ` My travel style is: ${styles.join(', ')}.`
    }

    const { text } = await generateText({
      model: google('gemini-2.5-flash-lite'),
      system: DESTINATION_NAMES_SYSTEM_PROMPT,
      prompt: prompt,
    })

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

export async function generateDestinationInfo(
  destinations: Array<{ country: string; region: string }>,
  params: GenerateDestinationParams
): Promise<Destination[]> {
  try {
    const { vibe, timePeriod, price, from } = params

    if (!vibe || vibe.trim().length === 0) {
      throw new Error('Vibe is required')
    }
    if (!destinations || destinations.length === 0) {
      throw new Error('At least one destination is required')
    }

    const period = timePeriod && timePeriod.trim().length > 0 ? timePeriod : 'Anytime'
    let prompt = `I want to ${vibe} in ${period}.`

    if (from) {
      prompt += ` I'm traveling from ${from}.`
    }

    if (params.budget && params.budget < 2000) {
      prompt += ` My daily budget is under $${params.budget}.`
    } else if (price) {
      prompt += ` My budget is ${price}.`
    }

    if (params.duration) {
      prompt += ` I plan to stay for ${params.duration[0]} to ${params.duration[1]} days.`
    }

    if (params.exclusions && params.exclusions.length > 0) {
      prompt += ` I want to AVOID: ${params.exclusions.join(', ')}.`
    }

    if (params.styles && params.styles.length > 0) {
      prompt += ` My travel style is: ${params.styles.join(', ')}.`
    }

    prompt += `\n\nProvide detailed information for the following ${destinations.length} destinations:\n`
    destinations.forEach((dest, index) => {
      prompt += `${index + 1}. ${dest.region}, ${dest.country}\n`
    })

    console.log(`[SERVER] Making single LLM call for ${destinations.length} destinations`)

    const { text } = await generateText({
      model: google('gemini-2.5-flash-lite'),
      system: DESTINATION_DETAIL_SYSTEM_PROMPT,
      prompt: prompt,
    })

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
