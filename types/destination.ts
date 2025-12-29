// Destination types originally from lib/generateDestinationInfo.ts

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
