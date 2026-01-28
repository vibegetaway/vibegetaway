export interface Location {
  location: string      // City/area
  spot: string         // Specific landmark
  country: string
  latitude: number
  longitude: number
  description: string
  prominence_score: number

  // Optional fields
  extended_description?: string
  best_time_to_visit?: string
  why_now?: string
  top_activities?: string[]
  nearby_attractions?: string[]
  practical_tips?: string
  travel_from_origin?: string
  image_keywords?: string
  match_reason?: string
  reddit_source_urls?: string[]
  image_url?: string
  price_level?: string
  highlights?: string[]
  tips?: string[]
  activities?: string[]
  social_proof?: { quote: string; source: string }

  // Fields from Perplexity search (mapped or kept for compatibility)
  price_class?: string
}

export interface DrawerItem {
  spot: string
  location: string
  country: string
  description: string
  highlights?: string[]
  activities?: string[]
  tips?: string[]
  image_keywords?: string
  image_url: string
  prominence_score: number
  price_level?: string
  social_proof?: { quote: string; source: string }

  // Optional fields included in ExploreMap construction
  extended_description?: string
  best_time_to_visit?: string
  why_now?: string
  nearby_attractions?: string[]
  practical_tips?: string
  travel_from_origin?: string
  match_reason?: string
  top_activities?: string[]
}
