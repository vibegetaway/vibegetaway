import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import type { GeneratedDay, TimeSlotActivity } from '@/lib/itinerary'

export const maxDuration = 60

interface GenerateItineraryRequest {
  destinations: Array<{
    region?: string
    country: string
    recommendedDuration?: string
  }>
  tripDuration: number
  vibe: string
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
    "dayNumber": 1,
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
    const body: GenerateItineraryRequest = await req.json()
    const { destinations, tripDuration, vibe } = body

    if (!destinations || destinations.length === 0) {
      return new Response(JSON.stringify({ error: 'No destinations provided' }), {
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

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    })

    const locationList = destinations
      .map(d => d.region ? `${d.region}, ${d.country}` : d.country)
      .join(', ')

    const recommendedDurations = destinations
      .map(d => {
        const name = d.region ? `${d.region}` : d.country
        const days = d.recommendedDuration || '3-5'
        return `${name}: ${days} days recommended`
      })
      .join('\n')

    const userPrompt = `Generate a ${tripDuration}-day travel itinerary for the following destinations: ${locationList}

The traveler's main interest/vibe: ${vibe || 'general exploration and relaxation'}

Destination recommendations:
${recommendedDurations}

Requirements:
1. Create exactly ${tripDuration} days of activities
2. Distribute time across all destinations intelligently based on activities available and recommendations
3. Include travel days between destinations (airports, transportation)
4. Each day should have morning, midday, and evening activities
5. Focus activities on the traveler's main interest: "${vibe}"
6. Keep it realistic - don't pack too many activities in one day
7. Include local food/dining recommendations for evenings

Return the itinerary as a JSON array.`

    console.log('[generate-itinerary] Making LLM call for', tripDuration, 'days across', destinations.length, 'destinations')

    const { text } = await generateText({
      model: google('gemini-2.5-flash-lite'),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.7,
    })

    const cleanedText = stripMarkdownFences(text)
    let generatedPlan: GeneratedDay[]

    try {
      generatedPlan = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('[generate-itinerary] Failed to parse LLM response:', cleanedText)
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

    const normalizedPlan: GeneratedDay[] = generatedPlan.map((day, index) => ({
      dayNumber: day.dayNumber || index + 1,
      location: day.location || 'Unknown',
      morning: normalizeTimeSlot(day.morning),
      midday: normalizeTimeSlot(day.midday),
      evening: normalizeTimeSlot(day.evening),
    }))

    console.log('[generate-itinerary] Successfully generated', normalizedPlan.length, 'days')

    return new Response(JSON.stringify({ plan: normalizedPlan }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[generate-itinerary] Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate itinerary' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

function normalizeTimeSlot(slot: any): TimeSlotActivity {
  if (!slot) {
    return { activity: 'Free time', description: 'Explore at your own pace.' }
  }

  if (typeof slot === 'string') {
    return { activity: slot, description: '' }
  }

  return {
    activity: slot.activity || 'Activity',
    description: slot.description || '',
  }
}
