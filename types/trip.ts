export interface TripFilters {
    origin: string
    locations: string[]
    duration: [number, number]
    budget: number
    exclusions: string[]
    styles: string[]
}

export interface TripPlanRequest {
  locations: Array<{
    region?: string
    country: string
    recommendedDuration?: string
    searchVibe?: string
  }>
  tripDuration: number
  filters?: Partial<TripFilters>
}
