'use server'

import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

export interface DestinationPricing {
  accommodation: {
    budget: string
    midRange: string
    luxury: string
  }
  food: string
  activities: string
}

export interface Destination {
  country: string
  region: string
  description: string[]
  
  pricing: DestinationPricing
}

export interface GenerateDestinationParams {
  vibe: string
  timePeriod: string
  price?: string
  from?: string
}

// Helper function to strip markdown code fences from JSON responses
function stripMarkdownFences(text: string): string {
  // Remove markdown code fences (```json, ```, etc.)
  let cleaned = text.trim()
  
  // Remove opening fence (```json, ```JSON, or just ```)
  cleaned = cleaned.replace(/^```(?:json|JSON)?\n?/, '')
  
  // Remove closing fence
  cleaned = cleaned.replace(/\n?```$/, '')
  
  return cleaned.trim()
}

const SYSTEM_PROMPT = `
You are a travel destination expert. Analyze free-form text about travel preferences and generate 10 suitable destinations ranked by relevance.

Parse for: activities/interests, timing/season, budget, travel style, climate/geography preferences.

For each destination provide:
1. Country name
2. Region/city name  
3. Description with 4-6 bullet points covering:
   - Why it matches their specific interests and activities
   - Seasonal suitability and timing
   - Key cultural sites and landmarks
   - Food scene highlights
   - Local atmosphere (markets, street life)
   - Nightlife or unique features (if relevant)
4. Price estimates (in USD per day):
   - Accommodation (budget/mid-range/luxury range)
   - Food (typical daily cost)
   - Activities (cost for their specific interests)

Tailor descriptions to user's stated interests. Focus on what they want to do, not generic tourist information.

Format STRICTLY as JSON array:

[
  {
    "country": "Country Name",
    "region": "Region or City Name",
    "description": [
      "Bullet point 1 — Description",
      "Bullet point 2 — Description",
      "Bullet point 3 — Description",
      "Bullet point 4 — Description",
      "Bullet point 5 — Description"
    ],
    "pricing": {
      "accommodation": {
        "budget": 20-40,
        "midRange": 60-100,
        "luxury": 150-300
      },
      "food": 15-30,
      "activities": 30-50
    }
  }
]

Output ONLY valid JSON—no preamble or additional text. Give back 10 destinations as options.
`

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

