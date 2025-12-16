import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createGroq } from '@ai-sdk/groq'
import { generateText } from 'ai'

export const maxDuration = 60

interface DayActivity {
  activity: string
  description: string
}

interface DayBreakdown {
  day: number
  location: string
  morning: DayActivity
  midday: DayActivity
  evening: DayActivity
}

interface PlanTripRequest {
  locations: Array<{
    region?: string
    country: string
    recommendedDuration?: string
  }>
  tripDuration: number
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
- Local culture and dining experiences
- Weather and optimal times for activities

For each day, provide ONE main activity/experience per time slot (morning, midday, evening).
Keep descriptions concise (1-2 sentences max).
Include travel days between destinations.

CRITICAL: Return ONLY a valid JSON array with no additional text, markdown, or explanation.

Example format:
[
  {
    "day": 1,
    "location": "Bali, Indonesia",
    "morning": {
      "activity": "Arrive in Bali",
      "description": "Land at Ngurah Rai Airport and transfer to your hotel in Canggu."
    },
    "midday": {
      "activity": "Beach exploration",
      "description": "Settle in and explore Canggu's famous surf beach."
    },
    "evening": {
      "activity": "Local dinner",
      "description": "Enjoy fresh seafood at a beachfront warung."
    }
  }
]`

export async function POST(req: Request) {
  try {
    const body: PlanTripRequest = await req.json()
    const { locations, tripDuration } = body

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

    const userPrompt = `Generate a ${tripDuration}-day travel itinerary for the following destinations: ${locationList}

Destination recommendations:
${recommendedDurations}

Requirements:
1. Create exactly ${tripDuration} days of activities
2. Distribute time across all destinations intelligently based on activities available and recommendations
3. Include travel days between destinations (airports, transportation)
4. Each day should have morning, midday, and evening activities
5. Keep it realistic - don't pack too many activities in one day
6. Include local food/dining recommendations for evenings

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
