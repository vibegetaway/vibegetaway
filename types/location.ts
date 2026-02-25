export interface Location {
  location: string      // City/area
  spot: string         // Specific landmark
  country: string
  latitude: number
  longitude: number
  description: string
  prominence_score: number
  reddit_source_urls: string[]

  // Fields present in ExploreMap but maybe not in Perplexity
  image_url?: string
  price_level?: string
  price_class?: string // From Perplexity

  // Extended fields
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
