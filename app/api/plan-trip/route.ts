import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createGroq } from '@ai-sdk/groq'
import { generateText } from 'ai'

export const maxDuration = 60

import { saveItineraryToHistory, type DayBreakdown, type DayActivity } from '@/lib/itineraryHistory'

interface TripFilters {
  origin: string
  budget: number
  exclusions: string[]
  styles: string[]
}

interface PlanTripRequest {
  locations: Array<{
    region?: string
    country: string
    recommendedDuration?: string
  }>
  tripDuration: number
  filters?: TripFilters
}

function stripMarkdownFences(text: string): string {
  let cleaned = text.trim()
  cleaned = cleaned.replace(/^```(?:json|JSON)?\n?/, '')
  cleaned = cleaned.replace(/\n?```$/, '')
  return cleaned.trim()
}

const SYSTEM_PROMPT = `You are an expert travel itinerary planner. Create realistic day-by-day trip plans that account for:
- Travel logistics between locations (include travel days when switching destinations)
- Activity duration and realistic scheduling
- Mix of main activities with exploration and rest
- Local culture and experiences
- Weather and optimal times for activities

CRITICAL INSTRUCTION ON STYLE:
- Do NOT name specific restaurants, cafes, or bars unless they are major historic landmarks/attractions themselves (e.g., "Have tea at the Ritz" is okay, "Lunch at Burger King" is NOT).
- Instead, describe the activity or region: e.g., "Enjoy fresh seafood by the harbor", "Street food tour in the Night Market", "Lunch in the historic Old Town".
- Focus on WHAT to do and WHERE (region/area), not specific commercial establishments for meals.

For each day, you MUST provide:
1. "location": The general area name
2. "coordinates": { "lat": number, "lng": number } - Center of activity for the day
3. "best_time_to_visit": Best time of day for main activities
4. "why_its_nice": Brief reasoning for this location/day
5. "morning", "midday", "evening": { "activity": string, "description": string }
6. "events": Array of special events/peculiarities (e.g., "Full Moon Party", "Night Market"). empty if none.
7. "alerts": Array of { "type": "warning"|"info", "message": string } (e.g., "Rainy season", "Political unrest"). empty if none.
8. "points_of_interest": Array of specific places to visit that day, with coordinates. Each POI MUST include:
    - "insight": A detailed explanation of WHY this spot is relevant (e.g., historical significance, biggest waterfall, rare bird spotting chance). Do not just give generic comments.
    - "tags": Array of 3 strings describing the vibe (e.g., "touristy", "culture", "quiet", "nature", "bustling").

CRITICAL: Return ONLY a valid JSON array with no additional text, markdown, or explanation.

Example format:
[
  {
    "day": 1,
    "location": "Uluwatu, Bali",
    "coordinates": { "lat": -8.8149, "lng": 115.0884 },
    "best_time_to_visit": "Late Afternoon for Sunset",
    "why_its_nice": "Stunning cliffside views and iconic temple.",
    "events": [
         { "name": "Kecak Fire Dance", "description": "Traditional dance performance at sunset." }
    ],
    "alerts": [
         { "type": "info", "message": "Monkeys can be aggressive with food." }
    ],
    "points_of_interest": [
        { 
            "name": "Uluwatu Temple", 
            "description": "Ancient sea temple.", 
            "insight": "One of Bali's nine key directional temples, perched on a steep cliff 70 meters above the roaring Indian Ocean. It is believed to guard the island from evil sea spirits.",
            "tags": ["culture", "history", "views"],
            "coordinates": { "lat": -8.8291, "lng": 115.0837 } 
        },
        { 
            "name": "Padang Padang Beach", 
            "description": "Beautiful beach cove.", 
            "insight": "Famous as a filming location for 'Eat Pray Love', this beach is accessed through a narrow rock crevice, revealing a hidden paradise with world-class surf breaks.",
            "tags": ["beach", "surf", "touristy"],
            "coordinates": { "lat": -8.8111, "lng": 115.1030 } 
        }
    ],
    "morning": {
      "activity": "Relax at Padang Padang Beach",
      "description": "Swim in turquoise waters and explore the cove."
    },
    "midday": {
      "activity": "Lunch in the Uluwatu Area",
      "description": "Enjoy local Indonesian cuisine at a cliffside warung."
    },
    "evening": {
      "activity": "Sunset at Uluwatu Temple",
      "description": "Watch the sunset and traditional Kecak dance."
    }
  }
]`

export async function POST(req: Request) {
  try {
    const body: PlanTripRequest = await req.json()
    const { locations, tripDuration, filters } = body

    if (!locations || locations.length === 0) {
      return new Response(JSON.stringify({ error: 'No locations provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!tripDuration || tripDuration < 1) {
      return new Response(JSON.stringify({ error: 'Invalid trip duration' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Use Groq with Llama in development, Gemini Flash in production
    const isDevelopment = process.env.NODE_ENV === 'development'

    let model: any
    if (isDevelopment && process.env.GROQ_API_KEY) {
      const groq = createGroq({
        apiKey: process.env.GROQ_API_KEY,
      })
      model = groq('llama-3.3-70b-versatile')
      console.log('[plan-trip] Using Groq (Llama 3.3 70B) in development')
    } else {
      const google = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      })
      model = google('gemini-2.0-flash-exp')
      console.log('[plan-trip] Using Gemini Flash in production')
    }

    const locationList = locations
      .map(l => l.region ? `${l.region}, ${l.country}` : l.country)
      .join(', ')

    const recommendedDurations = locations
      .map(l => {
        const name = l.region ? `${l.region}` : l.country
        const days = l.recommendedDuration || '3-5'
        return `${name}: ${days} days recommended`
      })
      .join('\n')

    let filterContext = ''
    if (filters) {
      const parts = []
      if (filters.origin) parts.push(`Starting Point: ${filters.origin}`)
      if (filters.budget) parts.push(`Budget: Approx $${filters.budget} total`)
      if (filters.styles && filters.styles.length > 0) parts.push(`Travel Styles: ${filters.styles.join(', ')}`)
      if (filters.exclusions && filters.exclusions.length > 0) parts.push(`Avoid: ${filters.exclusions.join(', ')}`)

      if (parts.length > 0) {
        filterContext = `\nAdditional Constraints & Preferences:\n${parts.join('\n')}\n`
      }
    }

    const userPrompt = `Generate a ${tripDuration}-day travel itinerary for the following destinations: ${locationList}

Destination recommendations:
${recommendedDurations}
${filterContext}
Requirements:
1. Create exactly ${tripDuration} days of activities
2. Distribute time across all destinations intelligently based on activities available and recommendations. Respect the order provided if logical.
3. Include travel days between destinations (airports, transportation)
4. Each day should have morning, midday, and evening activities
5. Keep it realistic - don't pack too many activities in one day
6. Include local food/dining recommendations for evenings
7. Tailor activities to the "Travel Styles" and preferences provided immediately above.
8. Include specific coordinates for the day's main location and recommended points of interest.
9. Suggest special events or peculiarities (e.g., night markets, festivals) if applicable.
10. warn about any potential issues (alerts) for that location.

Return the itinerary as a JSON array.`

    console.log('[plan-trip] Making LLM call for', tripDuration, 'days across', locations.length, 'locations')

    const { text } = await generateText({
      model,
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.7,
    })

    const cleanedText = stripMarkdownFences(text)
    let generatedPlan: DayBreakdown[]

    try {
      generatedPlan = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('[plan-trip] Failed to parse LLM response:', cleanedText)
      return new Response(JSON.stringify({ error: 'Failed to parse itinerary response' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!Array.isArray(generatedPlan) || generatedPlan.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid itinerary format returned' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const normalizedPlan: DayBreakdown[] = generatedPlan.map((day, index) => ({
      day: day.day || index + 1,
      location: day.location || 'Unknown',
      coordinates: day.coordinates,
      best_time_to_visit: day.best_time_to_visit,
      why_its_nice: day.why_its_nice,
      events: day.events || [],
      alerts: day.alerts || [],
      points_of_interest: (day.points_of_interest || []).map(normalizePOI),
      morning: normalizeActivity(day.morning),
      midday: normalizeActivity(day.midday),
      evening: normalizeActivity(day.evening),
    }))

    console.log('[plan-trip] Successfully generated', normalizedPlan.length, 'days')

    return new Response(JSON.stringify({ plan: normalizedPlan }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[plan-trip] Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate itinerary' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

function normalizeActivity(activity: any): DayActivity {
  if (!activity) {
    return { activity: 'Free time', description: 'Explore at your own pace.' }
  }

  if (typeof activity === 'string') {
    return { activity, description: '' }
  }

  return {
    activity: activity.activity || 'Activity',
    description: activity.description || '',
  }
}

function normalizePOI(poi: any) {
  return {
    name: poi.name || 'Unknown Spot',
    description: poi.description || '',
    insight: poi.insight || '',
    tags: Array.isArray(poi.tags) ? poi.tags.slice(0, 3) : [],
    coordinates: poi.coordinates || { lat: 0, lng: 0 }
  }
}
