import { NextRequest, NextResponse } from 'next/server'

const MAX_KEYWORDS_LENGTH = 500

/**
 * Image proxy endpoint that caches Pixabay images for 24 hours
 * Complies with Pixabay terms: images are served from our domain with CDN caching
 * instead of permanent hotlinking
 * 
 * Uses search keywords as the cache key instead of the Pixabay URL itself,
 * since Pixabay URLs can expire. Always returns small size images (previewURL)
 * for efficiency and faster loading.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const keywords = searchParams.get('keywords')

    if (!keywords) {
      return NextResponse.json(
        { error: 'Keywords parameter is required' },
        { status: 400 }
      )
    }

    if (keywords.length > MAX_KEYWORDS_LENGTH) {
      return NextResponse.json(
        { error: `Keywords too long. Max ${MAX_KEYWORDS_LENGTH} characters.` },
        { status: 400 }
      )
    }

    const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY

    if (!PIXABAY_API_KEY) {
      console.error('PIXABAY_API_KEY environment variable is not set')
      return NextResponse.redirect(new URL('/assets/icon-512.png', request.url))
    }

    // Try progressive fallback strategy if initial search fails
    const searchTerms = [
      keywords, // Original search
      keywords.split(' ').slice(0, 2).join(' '), // First 2 words
      keywords.split(' ')[0], // First word only
      'travel destination' // Ultimate fallback
    ]

    let imageUrl: string | null = null

    for (const searchTerm of searchTerms) {
      if (!searchTerm || searchTerm.trim().length === 0) continue

      const apiUrl = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(searchTerm)}&image_type=photo&per_page=3&safesearch=true`

      const response = await fetch(apiUrl, {
        next: { revalidate: 86400 } // Cache API response for 24 hours
      })

      if (!response.ok) {
        console.warn(`Pixabay API error for "${searchTerm}": ${response.status}`)
        continue
      }

      const data = await response.json()

      if (data.hits && data.hits.length > 0) {
        // Always use small size (previewURL) for efficiency
        imageUrl = data.hits[0].previewURL
        break
      }
    }

    if (!imageUrl) {
      console.warn(`No images found for keywords: ${keywords}`)
      return NextResponse.redirect(new URL('/assets/icon-512.png', request.url))
    }

    // Fetch the image from Pixabay with proper headers
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; vibegetaway/1.0)',
        'Accept': 'image/*',
        'Referer': 'https://pixabay.com/'
      }
    })

    if (!imageResponse.ok) {
      console.error(`Failed to fetch image from Pixabay: ${imageResponse.status}`)
      console.error(`URL that failed: ${imageUrl}`)
      console.error(`Response: ${await imageResponse.text().catch(() => 'Could not read response')}`)
      // Return fallback image on error
      return NextResponse.redirect(new URL('/assets/icon-512.png', request.url))
    }

    // Get the image data
    const imageBuffer = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'

    // Return image with 24-hour cache headers
    // The cache key is based on keywords, not the Pixabay URL
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Cache for 24 hours (86400 seconds)
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
        // Allow CORS for client-side access
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Error in cached-images API route:', error)
    // Return fallback on any error
    return NextResponse.redirect(new URL('/assets/icon-512.png', request.url))
  }
}
