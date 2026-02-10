export const MAX_DURATION = 60
export const MAX_LOCATIONS = 10
export const MAX_STRING_LENGTH = 500

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

export function validatePlanTripRequest(body: PlanTripRequest): string | null {
  const { locations, tripDuration, filters } = body

  if (!locations || !Array.isArray(locations) || locations.length === 0) {
    return 'No locations provided'
  }

  if (locations.length > MAX_LOCATIONS) {
    return `Too many locations. Max ${MAX_LOCATIONS} allowed.`
  }

  if (!tripDuration || tripDuration < 1 || tripDuration > MAX_DURATION) {
    return `Trip duration must be between 1 and ${MAX_DURATION} days`
  }

  if (filters && typeof filters === 'object') {
    if (filters.origin && typeof filters.origin === 'string' && filters.origin.length > MAX_STRING_LENGTH) {
      return 'Origin input too long'
    }
    if (filters.exclusions) {
      if (!Array.isArray(filters.exclusions)) {
        return 'Exclusions must be an array'
      }
      if (filters.exclusions.some(s => typeof s === 'string' && s.length > MAX_STRING_LENGTH)) {
        return 'Exclusion input too long'
      }
    }
    if (filters.styles) {
      if (!Array.isArray(filters.styles)) {
        return 'Styles must be an array'
      }
      if (filters.styles.some(s => typeof s === 'string' && s.length > MAX_STRING_LENGTH)) {
        return 'Style input too long'
      }
    }
  }

  return null
}
