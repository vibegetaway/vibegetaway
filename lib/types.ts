export interface BaseImage {
  urls: {
    small: string
    regular: string
    full: string
  }
  altDescription: string
}

export interface UnsplashImage extends BaseImage {
  id: string
}

export interface PixabayImage extends BaseImage {
  id: number
}

export type ImageType = UnsplashImage | PixabayImage

export interface Location {
  // Core fields (guaranteed by search)
  location: string      // City/area
  spot: string         // Specific landmark
  country: string
  latitude: number
  longitude: number
  description: string
  prominence_score: number
  reddit_source_urls: string[]

  // Standardized pricing field (formerly price_class)
  price_level?: string

  // Fields populated during enrichment or image fetching
  image_url?: string
  image_keywords?: string

  // Enrichment fields
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
