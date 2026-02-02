export const MAX_INPUT_LENGTH = 100
export const MAX_EXCLUSIONS_COUNT = 20

export interface InspirationRequest {
  activity: string
  location: string
  excludeActivities?: string[]
}

export function validateInspirationRequest(body: any): string | null {
  if (!body || typeof body !== 'object') {
    return 'Invalid request body'
  }

  const { activity, location, excludeActivities } = body

  if (!activity || typeof activity !== 'string' || activity.trim().length === 0) {
    return 'Activity is required'
  }
  if (activity.length > MAX_INPUT_LENGTH) {
    return `Activity too long (max ${MAX_INPUT_LENGTH} chars)`
  }

  if (!location || typeof location !== 'string' || location.trim().length === 0) {
    return 'Location is required'
  }
  if (location.length > MAX_INPUT_LENGTH) {
    return `Location too long (max ${MAX_INPUT_LENGTH} chars)`
  }

  if (excludeActivities !== undefined && excludeActivities !== null) {
    if (!Array.isArray(excludeActivities)) {
      return 'excludeActivities must be an array'
    }
    if (excludeActivities.length > MAX_EXCLUSIONS_COUNT) {
      return `Too many exclusions (max ${MAX_EXCLUSIONS_COUNT})`
    }
    for (const item of excludeActivities) {
      if (typeof item !== 'string') {
        return 'Exclusions must be strings'
      }
      if (item.length > MAX_INPUT_LENGTH) {
        return `Exclusion item too long (max ${MAX_INPUT_LENGTH} chars)`
      }
    }
  }

  return null
}
