import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'

export const maxDuration = 30

interface QuickstartRequest {
  activity: string
  location: string
  regenerateSlot?: 'morning' | 'midday' | 'evening'
  currentItinerary?: {
    morning: TimeSlotActivity
    midday: TimeSlotActivity
    evening: TimeSlotActivity
  }
  getAlternatives?: boolean
  targetSlot?: 'morning' | 'midday' | 'evening'
}

interface TimeSlotActivity {
  title: string
  description: string
  reason: string
}

function stripMarkdownFences(text: string): string {
  let cleaned = text.trim()
  cleaned = cleaned.replace(/^```(?:json|JSON)?\n?/, '')
  cleaned = cleaned.replace(/\n?```$/, '')
  return cleaned.trim()
}

const SYSTEM_PROMPT = `You are an expert single-day itinerary planner. Create realistic activity recommendations for a full day (morning, midday, evening) based on a user's desired activity and location.

For each time slot, provide:
1. "title": A short, engaging name for the activity
2. "description": What the user will do (2-3 sentences)
3. "reason": Why this activity fits their desired activity and time of day (1-2 sentences)

Guidelines:
- Activities should complement and build around the user's desired activity
- Morning activities should be energizing or foundational
- Midday activities should be the main focus or peak experience
- Evening activities should be relaxing or celebratory
- Consider local culture, weather, and optimal timing
- Be specific to the location provided
- Keep it realistic and achievable in one day

CRITICAL: Return ONLY valid JSON with no additional text, markdown, or explanation.`

const ALTERNATIVES_SYSTEM_PROMPT = `You are an expert at suggesting alternative activities. Given a time slot and the user's desired activity/location, suggest 3-5 alternative activities that could replace the current suggestion while maintaining the same vibe and time-of-day appropriateness.

Each alternative should have:
1. "title": A short, engaging name
2. "description": What they'll do (2-3 sentences)
3. "reason": Why this is a good alternative (1-2 sentences)

CRITICAL: Return ONLY a valid JSON array with no additional text, markdown, or explanation.`

export async function POST(req: Request) {
  try {
    const body: QuickstartRequest = await req.json()
    const { activity, location, regenerateSlot, currentItinerary, getAlternatives, targetSlot } = body

    if (!activity || typeof activity !== 'string' || activity.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Activity is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Location is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (activity.length > 200) {
      return new Response(JSON.stringify({ error: 'Activity description too long (max 200 chars)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (location.length > 200) {
      return new Response(JSON.stringify({ error: 'Location too long (max 200 chars)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    })
    const model = google('gemini-2.5-flash-lite')

    if (getAlternatives && targetSlot) {
      const userPrompt = `Generate 4 alternative activities for ${targetSlot} time slot.

User's desired activity: ${activity}
Location: ${location}
Time slot: ${targetSlot}
${currentItinerary ? `Current ${targetSlot} activity: ${currentItinerary[targetSlot].title}` : ''}

Return a JSON array of 4 alternatives in this format:
[
  {
    "title": "Activity name",
    "description": "What they'll do",
    "reason": "Why it's a good fit"
  }
]`

      const { text } = await generateText({
        model,
        system: ALTERNATIVES_SYSTEM_PROMPT,
        prompt: userPrompt,
        temperature: 0.8,
      })

      const cleanedText = stripMarkdownFences(text)
      let alternatives

      try {
        alternatives = JSON.parse(cleanedText)
      } catch (parseError) {
        console.error('[quickstart-itinerary] Failed to parse alternatives:', cleanedText)
        return new Response(JSON.stringify({ error: 'Failed to parse alternatives response' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ alternatives }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (regenerateSlot && currentItinerary) {
      const slotsToKeep = Object.keys(currentItinerary)
        .filter(slot => slot !== regenerateSlot)
        .map(slot => `${slot}: ${currentItinerary[slot as keyof typeof currentItinerary].title}`)
        .join('\n')

      const userPrompt = `Generate a new activity suggestion for the ${regenerateSlot} time slot only.

User's desired activity: ${activity}
Location: ${location}
Time slot to regenerate: ${regenerateSlot}

Keep these existing activities:
${slotsToKeep}

Return JSON in this format (only the ${regenerateSlot} slot):
{
  "title": "Activity name",
  "description": "What they'll do",
  "reason": "Why it fits"
}`

      const { text } = await generateText({
        model,
        system: SYSTEM_PROMPT,
        prompt: userPrompt,
        temperature: 0.9,
      })

      const cleanedText = stripMarkdownFences(text)
      let newActivity

      try {
        newActivity = JSON.parse(cleanedText)
      } catch (parseError) {
        console.error('[quickstart-itinerary] Failed to parse single slot:', cleanedText)
        return new Response(JSON.stringify({ error: 'Failed to parse activity response' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ 
        slot: regenerateSlot, 
        activity: newActivity 
      }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const userPrompt = `Create a full-day itinerary for someone who wants to do "${activity}" in ${location}.

Generate activities for:
- Morning (8am-12pm): Start the day right
- Midday (12pm-5pm): Peak activity time
- Evening (5pm-10pm): Wind down and enjoy

Return JSON in this exact format:
{
  "morning": {
    "title": "Activity name",
    "description": "What they'll do",
    "reason": "Why it's perfect for morning"
  },
  "midday": {
    "title": "Activity name",
    "description": "What they'll do",
    "reason": "Why it's perfect for midday"
  },
  "evening": {
    "title": "Activity name",
    "description": "What they'll do",
    "reason": "Why it's perfect for evening"
  }
}`

    console.log('[quickstart-itinerary] Generating full day itinerary')

    const { text } = await generateText({
      model,
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.7,
    })

    const cleanedText = stripMarkdownFences(text)
    let itinerary

    try {
      itinerary = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('[quickstart-itinerary] Failed to parse LLM response:', cleanedText)
      return new Response(JSON.stringify({ error: 'Failed to parse itinerary response' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!itinerary.morning || !itinerary.midday || !itinerary.evening) {
      return new Response(JSON.stringify({ error: 'Invalid itinerary format returned' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log('[quickstart-itinerary] Successfully generated itinerary')

    return new Response(JSON.stringify({ itinerary }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[quickstart-itinerary] Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate itinerary' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

