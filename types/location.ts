export interface Location {
  location: string      // City/area
  spot: string         // Specific landmark
  country: string
  latitude: number
  longitude: number
  description: string
  price_class: string
  prominence_score: number
  reddit_source_urls: string[]  // URLs of Reddit posts that mentioned this destination
  image_url?: string
}
