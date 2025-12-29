import { NextRequest, NextResponse } from 'next/server'
import type { UnsplashImage } from './types'

async function fetchUnsplashImages(
  keywords: string | string[],
  limit: number = 10
): Promise<UnsplashImage[]> {
  try {
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

    if (!UNSPLASH_ACCESS_KEY) {
      console.error('UNSPLASH_ACCESS_KEY environment variable is not set')
      return []
    }

    const keywordString = Array.isArray(keywords) 
      ? keywords.filter(k => k && k.trim().length > 0).join(' ')
      : keywords

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
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const single = searchParams.get('single') === 'true'
    const size = (searchParams.get('size') || 'regular') as 'small' | 'regular' | 'full'

    if (!keywords) {
      return NextResponse.json(
        { error: 'Keywords parameter is required' },
        { status: 400 }
      )
    }

    const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
    const keywordsToUse = keywordArray.length > 1 ? keywordArray : keywordArray[0]

    if (single) {
      const images = await fetchUnsplashImages(keywordsToUse, 1)
      const imageUrl = images.length > 0 ? images[0].urls[size] || images[0].urls.regular : null
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

