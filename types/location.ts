export interface Location {
  // Core fields required by all consumers
  location: string      // City/area
  spot: string         // Specific landmark
  country: string
  latitude: number
  longitude: number
  description: string
  prominence_score: number
  reddit_source_urls: string[]

  // Optional fields (populated by enrichment or specific sources)
  image_url?: string    // Optional to support varying data sources
  price_level?: string  // Standardized cost indication (formerly price_class)

  extended_description?: string
  best_time_to_visit?: string
  why_now?: string
  top_activities?: string[]
  nearby_attractions?: string[]
  practical_tips?: string
  travel_from_origin?: string
  image_keywords?: string
  match_reason?: string
  highlights?: string[]
  tips?: string[]
  activities?: string[]
  social_proof?: { quote: string; source: string }
}
