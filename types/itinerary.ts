export interface TimeSlotActivity {
  title: string
  description: string
  reason: string
  imageUrl?: string
  imageUrls?: string[]
}

export interface Itinerary {
  morning: TimeSlotActivity
  midday: TimeSlotActivity
  evening: TimeSlotActivity
}

export type TimeSlot = 'morning' | 'midday' | 'evening'
