
export interface Location {
  location: string      // City/area
  spot: string         // Specific landmark
  country: string
  latitude: number
  longitude: number
  description: string
  prominence_score: number
  reddit_source_urls: string[]

  // Optional shared/divergent fields
  image_url?: string
  price_class?: string // From perplexity
  price_level?: string // From ExploreMap

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

export interface UnsplashImage {
  id: string
  urls: {
    small: string
    regular: string
    full: string
  }
  altDescription: string
}

export interface DestinationPricing {
  accommodation: string
  food: string
  activities: string
}

export interface ImageKeywords {
  cover?: string
  gallery?: string
}

export interface Destination {
  country: string
  region?: string
  description?: string[]
  imagesKeywords?: ImageKeywords
  pricing?: DestinationPricing
  recommendedDuration?: string
  destinationAirportCode?: string
  coordinates?: {
    lat: number
    lng: number
  }
  searchVibe?: string
}

export interface GenerateDestinationParams {
  vibe: string
  timePeriod?: string
  price?: string
  from?: string
  destinations?: string[]
  duration?: [number, number]
  budget?: number
  exclusions?: string[]
  styles?: string[]
}
