'use server'

import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

export interface DestinationPricing {
  accommodation: string
  food: string
  activities: string
}

export interface Destination {
  country: string
  region?: string
  description?: string[]
  pricing?: DestinationPricing
}

export interface GenerateDestinationParams {
  vibe: string
  timePeriod: string
  price?: string
  from?: string
}

// Helper function to strip markdown code fences from JSON responses (```json, ```JSON, or just ```)
function stripMarkdownFences(text: string): string {
  let cleaned = text.trim()
  cleaned = cleaned.replace(/^```(?:json|JSON)?\n?/, '')
  cleaned = cleaned.replace(/\n?```$/, '')
  return cleaned.trim()
}

const COUNTRIES_SYSTEM_PROMPT = `
You are a travel destination expert. Analyze free-form text about travel preferences and generate all suitable destinations YOU WOULD PERSONALLY RECOMMEND.

Parse for: activities/interests, timing/season, budget, travel style, climate/geography preferences.

Format STRICTLY as JSON array of ISO 3166-1 alpha-3 country codes:
e.g. ["JPN", "THA", "ITA"]

Output ONLY valid JSON—no preamble or additional text. Give back all suitable destinations as options.
`

const SYSTEM_PROMPT = `
You are a travel destination expert. Analyze free-form text about travel preferences and generate up to 10 suitable destinations ranked by relevance.

Parse for: activities/interests, timing/season, budget, travel style, climate/geography preferences.

For each destination provide:
1. Country (ISO 3166-1 alpha-3 code)
2. Region/city name  
3. Description with 4-6 bullet points covering:
   - Why it matches their specific interests and activities. Focus on what they want to do, not generic tourist information.
   - Seasonal suitability and timing
   - Tailor descriptions to user's stated interests. 
   - Key cultural sites and landmarks
   - Food scene highlights
   - Use markdown formatting for bullet points.
4. Price estimates (in USD per day):
   - Accommodation (budget/mid-range/luxury range)
   - Food (typical daily cost)
   - Activities (cost for their specific interests)


Format STRICTLY as JSON array:

[
  {
    "country": "JPN",
    "region": "Tokyo",
    "description": [
      "✨ **Highlight 1**: Description 1",
      "🌊 **Highlight 2**: Description 2",
      "🍔 **Highlight 3**: Description 3",
      "🎉 **Highlight 4**: Description 4",
      "🎆 **Highlight 5**: Description 5"
    ],
    "pricing": {
      "accommodation": "20-40",
      "food": "15-30",
      "activities": "30-50"
    }
  }
]

Output ONLY valid JSON—no preamble or additional text. Give back 10 destinations as options.
`

export async function generateSuitableCountries(
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

    // Build a natural language prompt from structured parameters
    let prompt = `I want to ${vibe} in ${timePeriod}.`
    
    if (from) {
      prompt += ` I'm traveling from ${from}.`
    }
    
    if (price) {
      prompt += ` My budget is ${price}.`
    }

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: COUNTRIES_SYSTEM_PROMPT,
      prompt: prompt,
    })

    // Strip markdown fences if present, then parse the JSON response
    const cleanedText = stripMarkdownFences(text)
    const countries: string[] = JSON.parse(cleanedText)
    const destinations: Destination[] = countries.map(country => ({
      country: country,
    }))
    
    return destinations
  } catch (error) {
    console.error('Error generating destination info:', error)
    throw new Error(
      error instanceof Error 
        ? `Failed to generate destination info: ${error.message}`
        : 'Failed to generate destination info'
    )
  }
}

export async function generateSuitableDestinationInfo(
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

    // Build a natural language prompt from structured parameters
    let prompt = `I want to ${vibe} in ${timePeriod}.`
    
    if (from) {
      prompt += ` I'm traveling from ${from}.`
    }
    
    if (price) {
      prompt += ` My budget is ${price}.`
    }

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: SYSTEM_PROMPT,
      prompt: prompt,
    })

    // Strip markdown fences if present, then parse the JSON response
    const cleanedText = stripMarkdownFences(text)
    const destinations: Destination[] = JSON.parse(cleanedText)
    
    return destinations
  } catch (error) {
    console.error('Error generating destination info:', error)
    throw new Error(
      error instanceof Error 
        ? `Failed to generate destination info: ${error.message}`
        : 'Failed to generate destination info'
    )
  }
}

