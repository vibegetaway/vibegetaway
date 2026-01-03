import { NextRequest, NextResponse } from 'next/server'

/**
 * Image proxy endpoint that caches Pixabay images for 24 hours
 * Complies with Pixabay terms: images are served from our domain with CDN caching
 * instead of permanent hotlinking
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      )
    }

    // Validate that URL is from Pixabay for security
    try {
      const url = new URL(imageUrl)
      if (!url.hostname.includes('pixabay.com')) {
        return NextResponse.json(
          { error: 'Invalid image source' },
          { status: 400 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Fetch the image from Pixabay
    const imageResponse = await fetch(imageUrl)

    if (!imageResponse.ok) {
      console.error(`Failed to fetch image from Pixabay: ${imageResponse.status}`)
      // Return fallback image on error
      return NextResponse.redirect(new URL('/assets/icon-512.png', request.url))
    }

    // Get the image data
    const imageBuffer = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'

    // Return image with 24-hour cache headers
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

