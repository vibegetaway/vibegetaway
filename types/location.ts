export interface Location {
  location: string      // City/area
  spot: string         // Specific landmark
  country: string
  latitude: number
  longitude: number
  description: string
  prominence_score: number
  reddit_source_urls: string[]

  // Images
  image_url?: string
  image_keywords?: string

  // Pricing
  price_level?: string
  price_class?: string // Legacy/Perplexity

  // Enhanced details
  extended_description?: string
  best_time_to_visit?: string
  why_now?: string
  top_activities?: string[]
  nearby_attractions?: string[]
  practical_tips?: string
  travel_from_origin?: string
  match_reason?: string
  highlights?: string[]
  tips?: string[]
  activities?: string[]
  social_proof?: { quote: string; source: string }
}

export interface DrawerItem {
  spot: string
  location: string
  country: string
  description: string
  image_url: string
  prominence_score: number

  highlights?: string[]
  activities?: string[]
  tips?: string[]
  image_keywords?: string
  price_level?: string
  social_proof?: { quote: string; source: string }

  // Extended fields
  extended_description?: string
  best_time_to_visit?: string
  why_now?: string
  top_activities?: string[]
  nearby_attractions?: string[]
  practical_tips?: string
  travel_from_origin?: string
  match_reason?: string
}
