export interface TimeSlotActivity {
  title: string
  description: string
  reason: string
  imageUrl?: string
  imageUrls?: string[]
}

export type TimeSlot = 'morning' | 'midday' | 'evening'

export interface Itinerary {
  morning: TimeSlotActivity
  midday: TimeSlotActivity
  evening: TimeSlotActivity
}

export interface LockedSlots {
  morning: boolean
  midday: boolean
  evening: boolean
}
