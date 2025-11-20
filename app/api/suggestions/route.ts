import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { input, context, type = 'vibe' } = await req.json();

    if (!input || typeof input !== 'string') {
        return new Response('Input is required', { status: 400 });
    }

    // Prioritize Groq for speed, fallback to Gemini
    const groq = createGroq({
        apiKey: process.env.GROQ_API_KEY,
    });

    const google = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    const model = process.env.GROQ_API_KEY
        ? groq('llama-3.3-70b-versatile')
        : google('gemini-2.0-flash-exp');

    let systemPrompt = '';

    switch (type) {
        case 'event':
            systemPrompt = `You are a fast autocomplete engine for travel events and experiences.
      User is typing an event or activity for their trip.
      Complete their input with a single word or short phrase.
      Do NOT repeat the input. Only provide the suffix to complete the word/phrase.
      Examples:
      Input: "Full" -> Output: " Moon Party" (Full Moon Party)
      Input: "Jazz" -> Output: " Festival" (Jazz Festival)
      Input: "Food" -> Output: " market" (Food market)
      
      Context (already selected events): ${context || 'none'}
      Current Input: "${input}"
      Output only the completion suffix.`;
            break;
        case 'exclusion':
            systemPrompt = `You are a fast autocomplete engine for travel exclusions (things to avoid).
      User is typing something they want to avoid on their trip.
      Complete their input with a single word or short phrase.
      Do NOT repeat the input. Only provide the suffix to complete the word/phrase.
      Examples:
      Input: "Rain" -> Output: "y season" (Rainy season)
      Input: "Crow" -> Output: "ds" (Crowds)
      Input: "Mosq" -> Output: "uitoes" (Mosquitoes)
      
      Context (already selected exclusions): ${context || 'none'}
      Current Input: "${input}"
      Output only the completion suffix.`;
            break;
        case 'location':
            systemPrompt = `You are a fast autocomplete engine for travel locations.
      User is typing a location which could be a city, country, region, island, or airport code.
      Complete their input with a single word or short phrase.
      Do NOT repeat the input. Only provide the suffix to complete the word/phrase.
      Examples:
      Input: "Ba" -> Output: "li" (Bali)
      Input: "New Y" -> Output: "ork" (New York)
      Input: "JF" -> Output: "K" (JFK)
      Input: "South East A" -> Output: "sia" (South East Asia)
      
      Context (already selected locations): ${context || 'none'}
      Current Input: "${input}"
      Output only the completion suffix.`;
            break;
        case 'vibe':
        default:
            systemPrompt = `You are a fast autocomplete engine for travel vibes. 
      User is typing a "vibe" for their trip.
      Complete their input with a single word or short phrase.
      Do NOT repeat the input. Only provide the suffix to complete the word/phrase.
      If the input is a complete word, suggest a related second word starting with a space.
      Examples:
      Input: "hik" -> Output: "ing" (hiking)
      Input: "explore" -> Output: " nature" (explore nature)
      Input: "chi" -> Output: "ll" (chill)
      Input: "food" -> Output: "ie tour" (foodie tour)
      
      Context (already selected vibes): ${context || 'none'}
      Current Input: "${input}"
      Output only the completion suffix.`;
            break;
    }

    try {
        const { text } = await generateText({
            model,
            system: systemPrompt,
            prompt: input,
            temperature: 0.1,
        });

        return new Response(JSON.stringify({ suggestion: text }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Suggestion API Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate suggestion' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
