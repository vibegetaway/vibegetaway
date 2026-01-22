export interface Location {
  location: string      // City/area
  spot: string         // Specific landmark
  country: string
  latitude: number
  longitude: number
  description: string
  extended_description?: string
  best_time_to_visit?: string
  why_now?: string
  top_activities?: string[]
  nearby_attractions?: string[]
  practical_tips?: string
  travel_from_origin?: string
  image_keywords?: string
  match_reason?: string
  prominence_score: number
  reddit_source_urls: string[]
  image_url?: string // Optional as it might be added later
  price_level?: string
  price_class?: string // Compatibility with Perplexity output
  highlights?: string[]
  tips?: string[]
  activities?: string[]
  social_proof?: { quote: string; source: string }
}

export interface LocationProperties {
  cluster: boolean
  location: string
  spot: string
  country: string
  description: string
  highlights?: string[]
  activities?: string[]
  tips?: string[]
  image_keywords?: string
  prominence_score: number
  image_url: string // Properties usually expect it to be present for rendering?
  price_level?: string
  social_proof?: { quote: string; source: string }
}
