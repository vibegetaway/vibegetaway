import { NextRequest, NextResponse } from 'next/server'
import { cleanKeywords } from '@/lib/image-utils'
import type { Image } from '../types'

const MAX_LIMIT = 30
const MAX_KEYWORD_LENGTH = 100
const MAX_KEYWORDS_COUNT = 10

async function fetchUnsplashImages(
  keywords: string | string[],
  limit: number = 10
): Promise<Image[]> {
  try {
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

    if (!UNSPLASH_ACCESS_KEY) {
      console.error('UNSPLASH_ACCESS_KEY environment variable is not set')
      return []
    }

    const keywordString = cleanKeywords(keywords)

    if (!keywordString || keywordString.trim().length === 0) {
      console.warn('No keywords provided for Unsplash search')
      return []
    }

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keywordString)}&per_page=${limit}`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    })

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return data.results.map((photo: any) => ({
      id: photo.id,
      urls: {
        small: photo.urls.small,
        regular: photo.urls.regular,
        full: photo.urls.full
      },
      altDescription: photo.alt_description || 'Destination image'
    }))
  } catch (error) {
    console.error('Error fetching Unsplash images:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const keywords = searchParams.get('keywords')

    // Security: Validate limit
    let limit = parseInt(searchParams.get('limit') || '10', 10)
    if (isNaN(limit) || limit < 1) limit = 10
    if (limit > MAX_LIMIT) limit = MAX_LIMIT

    const single = searchParams.get('single') === 'true'

    // Security: Validate size
    let size = searchParams.get('size') || 'regular'
    if (!['small', 'regular', 'full'].includes(size)) {
      size = 'regular'
    }

    // Security: Validate keywords presence and length
    if (!keywords) {
      return NextResponse.json(
        { error: 'Keywords parameter is required' },
        { status: 400 }
      )
    }

    if (keywords.length > 500) { // Hard cap on raw string length
        return NextResponse.json(
            { error: 'Keywords parameter too long' },
            { status: 400 }
        )
    }

    const keywordArray = keywords.split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0)

    // Security: Limit number of keywords and length of each
    if (keywordArray.length > MAX_KEYWORDS_COUNT) {
         return NextResponse.json(
            { error: `Too many keywords. Max ${MAX_KEYWORDS_COUNT} allowed.` },
            { status: 400 }
        )
    }

    for (const k of keywordArray) {
        if (k.length > MAX_KEYWORD_LENGTH) {
            return NextResponse.json(
                { error: `Keyword '${k.substring(0, 20)}...' is too long. Max ${MAX_KEYWORD_LENGTH} chars.` },
                { status: 400 }
            )
        }
    }

    const keywordsToUse = keywordArray.length > 1 ? keywordArray : keywordArray[0]

    if (single) {
      const images = await fetchUnsplashImages(keywordsToUse, 1)
      const imageUrl = images.length > 0 ? images[0].urls[size as 'small' | 'regular' | 'full'] || images[0].urls.regular : null
      return NextResponse.json({ url: imageUrl })
    } else {
      const images = await fetchUnsplashImages(keywordsToUse, limit)
      return NextResponse.json({ images })
    }
  } catch (error) {
    console.error('Error in unsplash-images API route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    )
  }
}
