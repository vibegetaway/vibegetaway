import { NextRequest } from 'next/server'
import { google } from '@ai-sdk/google'
import { streamText } from 'ai'

export const maxDuration = 120

interface ExploreFilters {
    origin?: string
    destinations?: string[]
    budget?: number
    travelMonth?: string
}

function buildFilterContext(filters: ExploreFilters): string {
    const parts: string[] = []

    if (filters.origin) {
        parts.push(`• Traveling from: ${filters.origin}`)
    }

    if (filters.destinations && filters.destinations.length > 0) {
        parts.push(`• Interested in visiting: ${filters.destinations.join(', ')}`)
    }

    if (filters.budget) {
        const budgetLabel = filters.budget <= 500 ? 'Budget-friendly (under $500/day)'
            : filters.budget <= 1000 ? 'Budget to mid-range ($500-$1000/day)'
                : filters.budget <= 2000 ? 'Mid-range ($1000-$2000/day)'
                    : filters.budget <= 3500 ? 'Mid to high-end ($2000-$3500/day)'
                        : 'Luxury/premium ($3500+/day)'
        parts.push(`• Budget preference: ${budgetLabel}`)
    }

    if (filters.travelMonth) {
        parts.push(`• Planning to visit in: ${filters.travelMonth}`)
    }

    return parts.length > 0
        ? `\nTraveler preferences:\n${parts.join('\n')}`
        : ''
}

function buildExplorePrompt(query: string, filters: ExploreFilters): string {
    const filterContext = buildFilterContext(filters)
    
    const locationConstraint = filters.destinations && filters.destinations.length > 0
        ? `\n\nCRITICAL LOCATION CONSTRAINT:
You MUST ONLY return destinations that are located within: ${filters.destinations.join(', ')}
DO NOT return any destinations outside of these specified location(s).
If the query mentions activities or landmarks, they must be EXCLUSIVELY within the specified location(s).
For example, if the user asks for "hiking in Iceland", return ONLY hiking spots in Iceland, not hiking spots anywhere else.
This is a strict requirement - any destination outside the specified location(s) must be excluded.`
        : ''

    return `Search for travel destinations matching the query: "${query}" 
With the following filters:
${filterContext}${locationConstraint}

Use community travel discussions from Reddit, X.com, Lonely Planet, and other trusted travel sources to find destinations.
OUTPUT FORMAT - CRITICAL:
You MUST output each destination as a separate, complete JSON object on its own line.
Do NOT wrap destinations in an array or add any other text.
Each line must be valid JSON that can be parsed independently.

Format for each line:
{"spot":"Landmark Name","location":"City","country":"Country","latitude":0.0,"longitude":0.0,"description":"Brief compelling description","prominence_score":8,"image_keywords":"visual search terms"}
{"spot":"Landmark Name 2","location":"City 2","country":"Country 2","latitude":0.1,"longitude":0.1,"description":"Brief compelling description 2","prominence_score":7,"image_keywords":"visual search terms 2"}

Requirements:
- Output up to 20 destinations only if they are relevant to the query.
- Ensure coordinates are accurate
- Include diverse options (popular + hidden gems)
- Base prominence_score (1-10) on relevance to the query
- image_keywords: 2-3 visual keywords for finding photos (e.g. "Eiffel Tower sunset paris")

Start outputting destinations now:`
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const origin = searchParams.get('origin') || undefined
    const destinationsParam = searchParams.get('destinations')
    const destinations = destinationsParam ? destinationsParam.split(',').filter(Boolean) : undefined
    const budgetParam = searchParams.get('budget')
    const budget = budgetParam ? parseInt(budgetParam, 10) : undefined
    const travelMonth = searchParams.get('travelMonth') || undefined

    if (!query.trim()) {
        return new Response('data: {"type":"error","message":"No query provided"}\n\n', {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        })
    }

    const prompt = buildExplorePrompt(query, { origin, destinations, budget, travelMonth })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
        async start(controller) {
            try {
                const { textStream } = streamText({
                    model: google('gemini-2.5-flash-lite'),
                    messages: [
                        {
                            role: 'system',
                            content: `You are a travel destination expert that gives coordinates and details for travel spots. Output VALID JSON objects per line.`,
                        },
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                })

                let locationCount = 0
                let buffer = ''

                for await (const delta of textStream) {
                    buffer += delta
                    const lines = buffer.split('\n')
                    buffer = lines.pop() || ''

                    for (const line of lines) {
                        const trimmed = line.trim()
                        if (!trimmed || !trimmed.startsWith('{')) continue

                        try {
                            const location = JSON.parse(trimmed)
                            if (location.spot && location.latitude && location.longitude) {
                                locationCount++
                                controller.enqueue(encoder.encode(`data: {"type":"location","data":${JSON.stringify(location)}}\n\n`))
                            }
                        } catch (e) {
                            // Incomplete JSON line, ignore
                        }
                    }
                }

                // Process remaining buffer
                if (buffer.trim() && buffer.trim().startsWith('{')) {
                    try {
                        const location = JSON.parse(buffer.trim())
                        if (location.spot && location.latitude && location.longitude) {
                            locationCount++
                            controller.enqueue(encoder.encode(`data: {"type":"location","data":${JSON.stringify(location)}}\n\n`))
                        }
                    } catch (e) {
                        // Incomplete or invalid
                    }
                }

                controller.enqueue(encoder.encode(`data: {"type":"complete","count":${locationCount}}\n\n`))
                controller.close()

            } catch (error) {
                console.error("Gemini Search Error:", error)
                controller.enqueue(encoder.encode(`data: {"type":"error","message":"Stream error: ${error}"}\n\n`))
                controller.close()
            }
        }
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    })
}
