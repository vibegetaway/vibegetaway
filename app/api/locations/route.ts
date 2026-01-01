import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { createGroq } from '@ai-sdk/groq'
import { generateText } from 'ai'

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

// Allow up to 5 seconds for query expansion
export const maxDuration = 5

// Cache for Pixabay images to avoid repeated API calls
const imageCache = new Map<string, string>()

/**
 * Expand a search query into multiple related search terms using Groq Qwen3-32B
 */
async function expandQuery(query: string): Promise<string[]> {
  try {
    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    })

    const systemPrompt = `You are a travel search query expansion assistant. Your task is to take a user's search query and expand it into related search terms that would help find relevant travel locations.

For example:
- "beach" should expand to: beach, beaches, seaside, coastal, ocean, surf, swimming, tropical
- "temple" should expand to: temple, temples, shrine, shrines, religious, sacred, buddhist, hindu, worship, monastery
- "hiking" should expand to: hiking, trekking, trail, trails, mountain, mountains, nature walk, outdoor, adventure
- "food" should expand to: food, cuisine, restaurant, restaurants, dining, culinary, market, markets, street food

Return ONLY a comma-separated list of expanded search terms. Include:
1. The original term
2. Plural/singular variations
3. Synonyms and related concepts
4. Common misspellings if applicable

Do not add explanations, just return the comma-separated terms.`

    const { text } = await generateText({
      model: groq('qwen/qwen3-32b'),
      system: systemPrompt,
      prompt: query,
      temperature: 0.3,
    })

    // Parse the response and clean up the terms
    const expandedTerms = text
      .split(',')
      .map(term => term.trim().toLowerCase())
      .filter(term => term.length > 0)

    // Remove duplicates using Set
    const uniqueTerms = Array.from(new Set(expandedTerms))

    // Always include the original query
    if (!uniqueTerms.includes(query.toLowerCase())) {
      uniqueTerms.unshift(query.toLowerCase())
    }

    console.log(`Query expansion: "${query}" -> [${uniqueTerms.join(', ')}]`)
    return uniqueTerms
  } catch (error) {
    console.error('Error expanding query:', error)
    // Fallback to original query if expansion fails
    return [query.toLowerCase()]
  }
}

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
      // Search query: use AI to expand query and search across ALL columns
      const expandedTerms = await expandQuery(query)
      
      filteredLocations = parsedLocations.filter(loc => {
        // Convert all searchable fields to lowercase strings
        const searchableFields = [
          loc.location || '',
          loc.logical_location || '',
          loc.spot || '',
          loc.country || '',
          loc.activity || '',
          loc.description || '',
          loc.price_class || '',
          loc.tags || '',
        ].map(field => field.toLowerCase())
        
        // Check if ANY of the expanded terms matches ANY of the fields
        return expandedTerms.some(term => 
          searchableFields.some(field => field.includes(term))
        )
      })
      
      console.log(`Search for "${query}" found ${filteredLocations.length} results`)
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

