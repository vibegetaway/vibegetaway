export interface Location {
  location: string      // City/area
  logical_location: string  // Logical grouping (e.g., Bali)
  spot: string         // Specific landmark
  country: string
  latitude: number
  longitude: number
  activity: string
  description: string
  price_class: string
  prominence_score: number
  tags: string
  image_url: string
}
