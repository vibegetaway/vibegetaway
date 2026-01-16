import { NextRequest } from 'next/server'

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

    return `Find travel destinations for: "${query}"
${filterContext}

OUTPUT FORMAT (NDJSON - one JSON per line):
{"spot":"Name","location":"City","country":"Country","latitude":0.0,"longitude":0.0,"description":"Brief description","image_keywords":"search keywords","prominence_score":7}

RULES:
- Output 5-10 destinations
- One complete JSON object per line
- prominence_score: 1-10 (popularity)
- No extra text

Output now:`
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

    const apiKey = process.env.PERPLEXITY_API_KEY
    if (!apiKey) {
        return new Response('data: {"type":"error","message":"API key not configured"}\n\n', {
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
                const response = await fetch('https://api.perplexity.ai/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'sonar',
                        stream: true,
                        messages: [
                            {
                                role: 'system',
                                content: `You are a travel destination expert that analyzes Reddit travel discussions. Output destinations in NDJSON format - one complete JSON object per line.`
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        max_tokens: 8000,
                        temperature: 0.3,
                        search_domain_filter: ['reddit.com'],
                        search_recency_filter: 'month',
                    })
                })

                if (!response.ok) {
                    const errorText = await response.text()
                    controller.enqueue(encoder.encode(`data: {"type":"error","message":"Perplexity API error: ${response.status}"}\n\n`))
                    controller.close()
                    return
                }

                const reader = response.body?.getReader()
                if (!reader) {
                    controller.enqueue(encoder.encode(`data: {"type":"error","message":"No response body"}\n\n`))
                    controller.close()
                    return
                }

                let buffer = ''
                let locationCount = 0
                const decoder = new TextDecoder()

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    const chunk = decoder.decode(value, { stream: true })
                    const lines = chunk.split('\n')

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6)
                            if (data === '[DONE]') continue

                            try {
                                const parsed = JSON.parse(data)
                                const content = parsed.choices?.[0]?.delta?.content || ''
                                buffer += content

                                const bufferLines = buffer.split('\n')
                                buffer = bufferLines.pop() || ''

                                for (const jsonLine of bufferLines) {
                                    const trimmed = jsonLine.trim()
                                    if (!trimmed || !trimmed.startsWith('{')) continue

                                    try {
                                        const location = JSON.parse(trimmed)
                                        if (location.spot && location.latitude && location.longitude) {
                                            locationCount++
                                            controller.enqueue(encoder.encode(`data: {"type":"location","data":${JSON.stringify(location)}}\n\n`))
                                        }
                                    } catch (e) {
                                        console.error('Failed to parse NDJSON line:', trimmed, e)
                                    }
                                }
                            } catch (e) {
                                // Skip unparseable SSE data
                            }
                        }
                    }
                }

                // Process remaining buffer
                if (buffer.trim() && buffer.trim().startsWith('{')) {
                    const trimmed = buffer.trim()
                    try {
                        const location = JSON.parse(trimmed)
                        if (location.spot && location.latitude && location.longitude) {
                            locationCount++
                            controller.enqueue(encoder.encode(`data: {"type":"location","data":${JSON.stringify(location)}}\n\n`))
                        }
                    } catch (e) {
                        console.error('Failed to parse final NDJSON buffer:', trimmed, e)
                    }
                }

                controller.enqueue(encoder.encode(`data: {"type":"complete","count":${locationCount}}\n\n`))
                controller.close()
            } catch (error) {
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
