export interface Location {
  location: string
  spot: string
  country: string
  latitude: number
  longitude: number
  description: string
  prominence_score: number

  // Optional fields
  reddit_source_urls?: string[]
  image_url?: string
  price_level?: string

  // Enrichment fields
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
