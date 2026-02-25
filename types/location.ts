export interface Location {
  location: string      // City/area
  spot: string         // Specific landmark
  country: string
  latitude: number
  longitude: number
  description: string
  prominence_score: number
  reddit_source_urls?: string[]
  image_url?: string

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
  price_level?: string
  highlights?: string[]
  tips?: string[]
  activities?: string[]
  social_proof?: { quote: string; source: string }

  // To handle price_class compatibility if needed, though we prefer price_level
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
