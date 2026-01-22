import { NextRequest, NextResponse } from 'next/server'
import type { PixabayImage } from './types'

async function fetchPixabayImages(
    keywords: string | string[],
    limit: number = 10
): Promise<PixabayImage[]> {
    try {
        const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY

        if (!PIXABAY_API_KEY) {
            console.error('PIXABAY_API_KEY environment variable is not set')
            return []
        }

        const keywordString = Array.isArray(keywords)
            ? keywords.filter(k => k && k.trim().length > 0).join(' ')
            : keywords

        if (!keywordString || keywordString.trim().length === 0) {
            console.warn('No keywords provided for Pixabay search')
            return []
        }

        // Try progressive fallback strategy if initial search fails
        const searchTerms = [
            keywordString, // Original search
            keywordString.split(' ').slice(0, 2).join(' '), // First 2 words
            keywordString.split(' ')[0], // First word only
            'travel destination' // Ultimate fallback
        ]

        for (const searchTerm of searchTerms) {
            if (!searchTerm || searchTerm.trim().length === 0) continue

            const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(searchTerm)}&image_type=photo&per_page=${limit}&safesearch=true`

            const response = await fetch(url)

            if (!response.ok) {
                console.warn(`Pixabay API error for "${searchTerm}": ${response.status}`)
                continue
            }

            const data = await response.json()

            if (data.hits && data.hits.length > 0) {
                return data.hits.map((photo: any) => ({
                    id: photo.id,
                    urls: {
                        small: photo.previewURL,
                        regular: photo.webformatURL,
                        full: photo.largeImageURL
                    },
                    altDescription: photo.tags || 'Destination image'
                }))
            }
        }

        console.warn(`No images found for any fallback terms of: ${keywordString}. Status: ${keywords}`)
        return []
    } catch (error) {
        console.error('Error fetching Pixabay images:', error)
        return []
    }
}

const MAX_LIMIT = 50
const MAX_KEYWORD_LENGTH = 100
const MAX_KEYWORDS_COUNT = 10

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const keywords = searchParams.get('keywords')
        let limit = parseInt(searchParams.get('limit') || '10', 10)
        const single = searchParams.get('single') === 'true'
        const size = (searchParams.get('size') || 'regular') as 'small' | 'regular' | 'full'

        if (!keywords) {
            return NextResponse.json(
                { error: 'Keywords parameter is required' },
                { status: 400 }
            )
        }

        // Input validation
        if (keywords.length > 500) {
            return NextResponse.json(
                { error: 'Keywords string too long' },
                { status: 400 }
            )
        }

        const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)

        if (keywordArray.length > MAX_KEYWORDS_COUNT) {
            return NextResponse.json(
                { error: `Too many keywords (max ${MAX_KEYWORDS_COUNT})` },
                { status: 400 }
            )
        }

        if (keywordArray.some(k => k.length > MAX_KEYWORD_LENGTH)) {
            return NextResponse.json(
                { error: `Keyword too long (max ${MAX_KEYWORD_LENGTH} chars)` },
                { status: 400 }
            )
        }

        const keywordsToUse = keywordArray.length > 1 ? keywordArray : keywordArray[0]

        // Validate and clamp limit
        if (isNaN(limit) || limit < 1) limit = 10
        limit = Math.min(limit, MAX_LIMIT)

        // Note: Pixabay pagination is per_page, but we pass limit to our internal function
        // If single is requested, we fetch a few and return the first one to be safe, 
        // or we could fetch just 3 to have some variety if we were doing client-side picking,
        // but here we just need one.
        const fetchLimit = single ? 3 : limit

        const images = await fetchPixabayImages(keywordsToUse, fetchLimit)

        if (single) {
            const imageUrl = images.length > 0 ? images[0].urls[size] || images[0].urls.regular : null
            return NextResponse.json({ url: imageUrl })
        } else {
            return NextResponse.json({ images })
        }
    } catch (error) {
        console.error('Error in pixabay-images API route:', error)
        return NextResponse.json(
            { error: 'Failed to fetch images' },
            { status: 500 }
        )
    }
}
