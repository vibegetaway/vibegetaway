import type { TimeSlotActivity } from './itinerary'

export interface QuickstartRequest {
  activity: string
  location: string
  regenerateSlot?: 'morning' | 'midday' | 'evening'
  currentItinerary?: {
    morning: TimeSlotActivity
    midday: TimeSlotActivity
    evening: TimeSlotActivity
  }
  getAlternatives?: boolean
  targetSlot?: 'morning' | 'midday' | 'evening'
}

export interface TripFilters {
  origin: string
  budget: number
  exclusions: string[]
  styles: string[]
}

export interface PlanTripRequest {
  locations: Array<{
    region?: string
    country: string
    recommendedDuration?: string
    searchVibe?: string
  }>
  tripDuration: number
  filters?: TripFilters
}
