import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { stripMarkdownFences } from '@/lib/utils'

export const maxDuration = 30

interface InspirationCard {
  id: string
  title: string
  location: string
  description: string
  category: 'adventure' | 'culture' | 'food' | 'relaxation' | 'nightlife'
  imageKeywords: string
  imageUrl?: string
}

interface InspirationRequest {
  activity: string
  location: string
  excludeActivities?: string[]
}

const SYSTEM_PROMPT = `You are a travel inspiration generator. Create diverse, exciting activity suggestions that combine specific activities with real locations.

For each suggestion, provide:
1. "title": Short, catchy activity name (2-5 words)
2. "location": Specific real place where this activity happens (e.g., "Kuta Beach, Bali" or "Shibuya, Tokyo")
3. "description": What makes this experience special (1-2 sentences)
4. "category": One of: adventure, culture, food, relaxation, nightlife
5. "imageKeywords": 2-3 keywords for finding a relevant photo (e.g., "bali surfing sunset")

Guidelines:
- Be specific with locations - use real places, beaches, neighborhoods, landmarks
- Mix different categories for variety
- Make suggestions exciting and aspirational
- Consider the user's interests but also suggest unexpected discoveries
- Each suggestion should feel unique and memorable

CRITICAL: Return ONLY a valid JSON array with no additional text, markdown, or explanation.`

export async function POST(req: Request) {
  try {
    const body: InspirationRequest = await req.json()
    const { activity, location, excludeActivities = [] } = body

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

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    })
    const model = google('gemini-2.5-flash-lite')

    const excludeText = excludeActivities.length > 0
      ? `\n\nDo NOT suggest these activities (already shown): ${excludeActivities.join(', ')}`
      : ''

    const userPrompt = `Generate 5 unique travel inspiration cards for someone interested in "${activity}" around ${location}.${excludeText}

Return a JSON array in this exact format:
[
  {
    "title": "Sunset Surf Session",
    "location": "Uluwatu Beach, Bali",
    "description": "Catch legendary waves as the sun paints the sky golden over ancient clifftop temples.",
    "category": "adventure",
    "imageKeywords": "uluwatu surfing sunset"
  }
]

Generate 5 diverse suggestions mixing different categories.`

    const { text } = await generateText({
      model,
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.9,
    })

    const cleanedText = stripMarkdownFences(text)
    let cards: Omit<InspirationCard, 'id'>[]

    try {
      cards = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('[inspiration-cards] Failed to parse response:', cleanedText)
      return new Response(JSON.stringify({ error: 'Failed to parse inspiration cards' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!Array.isArray(cards) || cards.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid cards format returned' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const cardsWithIds: InspirationCard[] = cards.slice(0, 5).map((card, index) => ({
      ...card,
      id: `card-${Date.now()}-${index}`,
    }))

    const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY

    // Fetch images from Pixabay for each card
    const cardsWithImages = await Promise.all(
      cardsWithIds.map(async (card) => {
        try {
          if (!PIXABAY_API_KEY) {
            console.warn('[inspiration-cards] PIXABAY_API_KEY not configured')
            return card
          }

          // Progressive fallback strategy for image search
          const searchTerms = [
            card.imageKeywords, // Original search
            card.imageKeywords.split(' ').slice(0, 2).join(' '), // First 2 words
            card.imageKeywords.split(' ')[0], // First word only
            'travel destination' // Ultimate fallback
          ]

          for (const searchTerm of searchTerms) {
            if (!searchTerm || searchTerm.trim().length === 0) continue

            const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(searchTerm)}&image_type=photo&per_page=3&safesearch=true`
            const response = await fetch(url)

            if (response.ok) {
              const data = await response.json()
              if (data.hits && data.hits.length > 0) {
                return {
                  ...card,
                  imageUrl: data.hits[0].webformatURL,
                }
              }
            }
          }

          console.warn(`[inspiration-cards] No image found for ${card.title}`)
        } catch (error) {
          console.error(`[inspiration-cards] Failed to fetch image for ${card.title}:`, error)
        }
        return card
      })
    )

    return new Response(JSON.stringify({ cards: cardsWithImages }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[inspiration-cards] Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate inspiration cards' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
