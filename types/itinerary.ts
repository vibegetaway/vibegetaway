export interface DayActivity {
  activity: string
  description: string
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
  coordinates: {
    lat: number
    lng: number
  }
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
  events?: { name: string; description: string }[]
  alerts?: { type: 'warning' | 'info'; message: string }[]
  points_of_interest?: PointOfInterest[]
  morning: DayActivity
  midday: DayActivity
  evening: DayActivity
}
