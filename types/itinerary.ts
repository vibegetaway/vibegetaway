export interface TimeSlotActivity {
  title: string
  description: string
  reason: string
}

export interface Itinerary {
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

export interface ItineraryCardProps {
  destination: string
  date: string
  image: string
  type: string
  keywords?: string
}
