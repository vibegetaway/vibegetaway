import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

interface Location {
  location: string      // City/area
  logical_location: string  // Logical grouping (e.g., Bali)
  spot: string         // Specific landmark
  country: string
  latitude: number
  longitude: number
  activity: string
  description: string
  price_class: string
  prominence_score: number
  tags: string
  image_url: string
}

// Cache for Pixabay images to avoid repeated API calls
const imageCache = new Map<string, string>()

async function fetchPixabayImage(spot: string, location: string, tags: string): Promise<string> {
  const cacheKey = `${spot}-${location}`
  
  // Check cache first
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!
  }
  
  try {
    const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY
    
    if (!PIXABAY_API_KEY) {
      console.error('PIXABAY_API_KEY not set')
      return '/assets/icon-512.png' // Fallback image
    }
    
    // Try different search strategies
    const searchTerms = [
      `${spot} ${location}`, // Most specific
      spot, // Just the spot name
      tags.split(',')[0]?.trim(), // First tag
      location, // Just the location
    ].filter(Boolean)
    
    for (const searchTerm of searchTerms) {
      const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(searchTerm)}&image_type=photo&per_page=3&safesearch=true`
      
      const response = await fetch(url, { 
        next: { revalidate: 86400 } // Cache for 24 hours
      })
      
      if (!response.ok) continue
      
      const data = await response.json()
      
      if (data.hits && data.hits.length > 0) {
        const imageUrl = data.hits[0].webformatURL || data.hits[0].previewURL
        imageCache.set(cacheKey, imageUrl)
        return imageUrl
      }
    }
    
    // Fallback if no images found
    const fallbackUrl = '/assets/icon-512.png'
    imageCache.set(cacheKey, fallbackUrl)
    return fallbackUrl
  } catch (error) {
    console.error(`Error fetching image for ${spot}:`, error)
    return '/assets/icon-512.png'
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const viewport = searchParams.get('viewport') || ''

    // Read CSV file from public directory
    const csvPath = join(process.cwd(), 'public', 'data', 'global_locations_dataset_10k.csv')
    const csvText = readFileSync(csvPath, 'utf-8')
    
    const lines = csvText.split('\n')
    
    // Parse CSV with proper handling of quoted fields
    const parsedLocations = lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values: string[] = []
        let current = ''
        let inQuotes = false
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }
        values.push(current.trim())
        
        return {
          location: values[0] || '',
          logical_location: values[1] || '',
          country: values[2] || '',
          spot: values[3] || '',
          latitude: parseFloat(values[4]),
          longitude: parseFloat(values[5]),
          activity: values[6] || '',
          description: values[7] || '',
          price_class: values[8] || '',
          prominence_score: parseInt(values[9]) || 0,
          tags: values[10] || '',
          image_url: values[11] || '',
        }
      })
      .filter(loc => !isNaN(loc.latitude) && !isNaN(loc.longitude) && loc.image_url)

    let filteredLocations: Location[] = []

    if (query.trim()) {
      // Search query: ignore viewport, search globally in 3 fields
      const queryLower = query.toLowerCase().trim()
      filteredLocations = parsedLocations.filter(loc => {
        return (
          (loc.location && loc.location.toLowerCase().includes(queryLower)) ||
          (loc.logical_location && loc.logical_location.toLowerCase().includes(queryLower)) ||
          (loc.country && loc.country.toLowerCase().includes(queryLower))
        )
      })
    } else if (viewport.trim()) {
      // No query but viewport provided: filter by viewport bounds
      const [north, south, east, west] = viewport.split(',').map(parseFloat)
      
      if (!isNaN(north) && !isNaN(south) && !isNaN(east) && !isNaN(west)) {
        filteredLocations = parsedLocations.filter(loc => {
          return (
            loc.latitude <= north &&
            loc.latitude >= south &&
            loc.longitude <= east &&
            loc.longitude >= west
          )
        })
      } else {
        // Invalid viewport format, return all locations
        filteredLocations = parsedLocations
      }
    } else {
      // No query and no viewport: return all locations
      filteredLocations = parsedLocations
    }

    // Always sort by prominence_score descending
    filteredLocations.sort((a, b) => b.prominence_score - a.prominence_score)

    // Limit to top 50 results
    const limitedLocations = filteredLocations.slice(0, 50)

    // Fetch fresh images for each location in parallel
    const locationsWithImages = await Promise.all(
      limitedLocations.map(async (loc) => {
        const freshImageUrl = await fetchPixabayImage(loc.spot, loc.location, loc.tags)
        return {
          ...loc,
          image_url: freshImageUrl
        }
      })
    )

    return NextResponse.json({ locations: locationsWithImages })
  } catch (error) {
    console.error('Error in locations API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

