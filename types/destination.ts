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
