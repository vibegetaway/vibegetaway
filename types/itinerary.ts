import type { Destination } from '@/lib/generateDestinationInfo'

export interface TimeSlotActivity {
  title: string
  description: string
  reason: string
  imageUrl?: string
  imageUrls?: string[]
}

export interface DayItinerary {
  day: number
  location: string
  morning: TimeSlotActivity
  midday: TimeSlotActivity
  evening: TimeSlotActivity
}

export type TimeSlot = 'morning' | 'midday' | 'evening'

export interface LockedSlots {
  morning: boolean
  midday: boolean
  evening: boolean
}

export interface DayActivity {
  activity: string
  description: string
  imageUrl?: string
  imageUrls?: string[]
}

export interface DayBreakdown {
  day: number
  location: string
  coordinates?: {
    lat: number
    lng: number
  }
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
  points_of_interest?: Array<{
    name: string
    description: string
    insight?: string
    tags?: string[]
    cost?: string
    duration?: string
    coordinates: {
      lat: number
      lng: number
    }
  }>
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

export interface QuickstartRequest {
  activity: string
  location: string
  regenerateSlot?: TimeSlot
  currentItinerary?: {
    morning: TimeSlotActivity
    midday: TimeSlotActivity
    evening: TimeSlotActivity
  }
  getAlternatives?: boolean
  targetSlot?: TimeSlot
}

export interface QuickstartItinerary {
  morning: TimeSlotActivity
  midday: TimeSlotActivity
  evening: TimeSlotActivity
}
