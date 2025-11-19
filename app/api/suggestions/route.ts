import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { input, context } = await req.json();

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
        ? groq('llama-3.1-8b-instant')
        : google('gemini-1.5-flash');

    try {
        const { text } = await generateText({
            model,
            system: `You are a fast autocomplete engine for travel vibes. 
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
      Output only the completion suffix.`,
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
