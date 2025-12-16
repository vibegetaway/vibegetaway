import { createGroq } from '@ai-sdk/groq'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'

interface GenerateNameRequest {
  locations: Array<{ region?: string; country: string }>
  tripDuration: number
}

export async function POST(req: Request) {
  try {
    const body: GenerateNameRequest = await req.json()
    const { locations, tripDuration } = body

    if (!locations || locations.length === 0) {
      return NextResponse.json(
        { error: 'Locations are required' },
        { status: 400 }
      )
    }

    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    })

    const locationList = locations
      .map(loc => loc.region || loc.country)
      .join(', ')

    const prompt = `Generate a short, creative, and memorable name for a ${tripDuration}-day trip itinerary to: ${locationList}

Requirements:
- Maximum 5 words
- Catchy and evocative
- Captures the essence of the destinations
- No quotation marks
- Examples: "Alpine Adventure Odyssey", "Coastal Thailand Escape", "European Cultural Journey"

Return ONLY the trip name, nothing else.`

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt,
      temperature: 0.8,
    })

    const name = text.trim().replace(/['"]/g, '')

    return NextResponse.json({ name })
  } catch (error) {
    console.error('Error generating itinerary name:', error)
    return NextResponse.json(
      { error: 'Failed to generate itinerary name' },
      { status: 500 }
    )
  }
}
