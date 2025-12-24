import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 })
    }

    const apiKey = process.env.LOCATIONIQ_API_KEY

    if (!apiKey) {
      console.error('LOCATIONIQ_API_KEY is not set')
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const response = await fetch(
      `https://api.locationiq.com/v1/autocomplete?key=${apiKey}&q=${encodeURIComponent(query)}&limit=5&accept-language=en`
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('LocationIQ API error:', response.status, errorText)
      return NextResponse.json({ error: 'LocationIQ API request failed' }, { status: response.status })
    }

    const data = await response.json()

    if (data.error) {
      console.warn('LocationIQ API error:', data.error)
      return NextResponse.json({ suggestions: [] })
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions = data.map((place: any) => {
      const nameParts = place.display_name?.split(',') || []
      const cityName = nameParts[0]?.trim() || ''
      const regionName = nameParts[1]?.trim() || place.address?.state || ''
      const countryName = place.address?.country || ''
      
      let finalCountryName = countryName
      if (!finalCountryName && place.display_name) {
        const parts = place.display_name.split(',').map((p: string) => p.trim())
        finalCountryName = parts[parts.length - 1] || ''
      }
      
      if (!finalCountryName) {
        finalCountryName = place.address?.country_code || ''
      }
      
      const firstThreeParts = nameParts.slice(0, 3).map((p: string) => p.trim()).join(', ')
      
      return {
        name: cityName,
        country: finalCountryName,
        region: firstThreeParts || cityName,
        regionName: regionName,
        coordinates: place.lat && place.lon ? {
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon)
        } : undefined
      }
    })

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Error in city search API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

