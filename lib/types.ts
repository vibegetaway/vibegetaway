export interface Coordinates {
  lat: number
  lng: number
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
  coordinates?: Coordinates
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

export interface DayActivity {
  activity: string
  description: string
  reason?: string // Optional as it's not always present in DayActivity but is in QuickstartActivity/TimeSlotActivity
  imageUrl?: string
  imageUrls?: string[]
}

export interface PointOfInterest {
  name: string
  description: string
  insight?: string
  tags?: string[]
  cost?: string
  duration?: string
  coordinates: Coordinates
}

export interface DayBreakdown {
  day: number
  location: string
  coordinates?: Coordinates
  best_time_to_visit?: string
  why_its_nice?: string
  events?: Array<{
    name: string
    description: string
  }>
  alerts?: Array<{
    type: 'warning' | 'info'
    message: string
  }>
  points_of_interest?: PointOfInterest[]
  morning: DayActivity
  midday: DayActivity
  evening: DayActivity
}

export interface SavedItinerary {
  id: string
  name: string
  timestamp: number
  locations: Destination[]
  tripDuration: number
  generatedPlan: DayBreakdown[]
}

// Quickstart / Plan types (UI state focused)
export interface QuickstartActivity {
  title: string
  description: string
  reason: string
  imageUrl?: string
  imageUrls?: string[]
}

export interface QuickstartItinerary {
  morning: QuickstartActivity
  midday: QuickstartActivity
  evening: QuickstartActivity
}
