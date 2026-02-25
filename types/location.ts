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
  image_url?: string
  price_level?: string
  price_class?: string // Legacy optional
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
  image_url: string
  price_level?: string
  social_proof?: { quote: string; source: string }
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
}
