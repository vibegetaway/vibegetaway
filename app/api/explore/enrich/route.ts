import { google } from '@ai-sdk/google'
import { streamText } from 'ai'

export const maxDuration = 60

export async function POST(req: Request) {
    try {
        const { locations, query, origin, budget, travelMonth } = await req.json()

        if (!locations || !Array.isArray(locations) || locations.length === 0) {
            console.error('Enrich API: No locations provided')
            return new Response('No locations provided', { status: 400 })
        }

        console.log(`Enriching ${locations.length} locations for query: "${query}" (Origin: ${origin}, Budget: ${budget}, Month: ${travelMonth})`)

        const prompt = `
    You are a travel expert. I have a list of travel destinations found for the user's request: "${query}".
    
    User Context:
    - Origin: ${origin || 'Not specified'}
    - Budget: ${budget ? '$' + budget : 'Not specified'}
    - Travel Month: ${travelMonth || 'Not specified'}

    For EACH destination, provide detailed travel information RELEVANT TO THIS SPECIFIC QUERY AND CONTEXT.
    If the user asked for parties, mention party spots. If they asked for relaxation, mention spas/beaches.
    
    Locations: ${JSON.stringify(locations.map((l: any) => ({ spot: l.spot, location: l.location, country: l.country })))}

    OUTPUT FORMAT:
    - Provide ONE valid JSON object per line (NDJSON format).
    - Do not wrap the output in a list or array.
    - Do not include markdown code blocks.
    
    JSON Schema per line:
    {"spot":"Name","location":"City","price_level":"$$","highlights":["Highlight 1","Highlight 2"],"activities":["Activity 1","Activity 2"],"tips":["Tip 1","Tip 2"],"social_proof":{"quote":"Best pizza ever!","source":"Reddit"}}

    RULES:
    - price_level: $, $$, $$$, $$$$, or $$$$$ (Cost per day estimation)
    - highlights: up to 5 distinct reasons to visit, tailored to "${query}".
    - activities: up to 5 specific things to do, tailored to "${query}".
    - tips: up to 5 practical tips (best time, local customs), tailored to "${query}".
    - social_proof: Find a RELEVANT positive review/quote from a traveler on Reddit, TripAdvisor, or X. Include the source (e.g., "User on Reddit").
    - OUTPUT ONE JSON OBJECT PER LINE FOR EACH LOCATION.
    - DO NOT HALLUCINATE LOCATIONS NOT IN THE LIST.
    - STREAM THE OUTPUT AS YOU GENERATE IT.
    `

        const result = streamText({
            model: google('gemini-2.5-flash-lite'),
            prompt: prompt,
        })

        return result.toTextStreamResponse()
    } catch (error) {
        console.error('Error in Enrich API:', error)
        return new Response('Internal Server Error', { status: 500 })
    }
}
