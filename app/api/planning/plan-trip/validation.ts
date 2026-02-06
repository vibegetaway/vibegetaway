
export const MAX_LOCATIONS = 10;
export const MAX_DURATION = 60;
export const MAX_STRING_LENGTH = 500; // General limit for longer text fields
export const MAX_FIELD_LENGTH = 100; // Specific field limit for short fields (country, region)

export interface TripFilters {
  origin?: string;
  budget?: number;
  exclusions?: string[];
  styles?: string[];
}

export interface LocationInput {
  region?: string;
  country: string;
  recommendedDuration?: string;
  searchVibe?: string;
}

export interface PlanTripRequest {
  locations: LocationInput[];
  tripDuration: number;
  filters?: TripFilters;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedBody?: PlanTripRequest;
}

function sanitizeString(str: string): string {
  // Remove newlines, carriage returns, and trim
  return str.replace(/[\n\r]/g, ' ').trim();
}

export function validatePlanTripRequest(body: any): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Invalid request body' };
  }

  const { locations, tripDuration, filters } = body;

  // Validate tripDuration
  if (typeof tripDuration !== 'number' || tripDuration < 1 || tripDuration > MAX_DURATION) {
    return { isValid: false, error: `Trip duration must be between 1 and ${MAX_DURATION} days` };
  }

  // Validate locations array
  if (!locations || !Array.isArray(locations) || locations.length === 0) {
    return { isValid: false, error: 'No locations provided' };
  }

  if (locations.length > MAX_LOCATIONS) {
    return { isValid: false, error: `Too many locations. Max ${MAX_LOCATIONS} allowed.` };
  }

  const sanitizedLocations: LocationInput[] = [];

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    if (typeof loc !== 'object' || loc === null) {
      return { isValid: false, error: `Location at index ${i} is invalid` };
    }

    // Validate country (required)
    if (!loc.country || typeof loc.country !== 'string') {
      return { isValid: false, error: `Location at index ${i} missing valid country` };
    }
    if (loc.country.length > MAX_FIELD_LENGTH) {
      return { isValid: false, error: `Location country at index ${i} too long (max ${MAX_FIELD_LENGTH})` };
    }

    // Validate optional fields and construct sanitized object
    const sanitizedLoc: LocationInput = {
      country: sanitizeString(loc.country),
    };

    if (loc.region !== undefined) {
      if (typeof loc.region !== 'string') return { isValid: false, error: `Invalid region at index ${i}` };
      if (loc.region.length > MAX_FIELD_LENGTH) return { isValid: false, error: `Region at index ${i} too long` };
      sanitizedLoc.region = sanitizeString(loc.region);
    }

    if (loc.searchVibe !== undefined) {
      if (typeof loc.searchVibe !== 'string') return { isValid: false, error: `Invalid searchVibe at index ${i}` };
      if (loc.searchVibe.length > MAX_FIELD_LENGTH) return { isValid: false, error: `SearchVibe at index ${i} too long` };
      sanitizedLoc.searchVibe = sanitizeString(loc.searchVibe);
    }

    if (loc.recommendedDuration !== undefined) {
      if (typeof loc.recommendedDuration !== 'string') return { isValid: false, error: `Invalid recommendedDuration at index ${i}` };
      if (loc.recommendedDuration.length > 50) return { isValid: false, error: `RecommendedDuration at index ${i} too long` };
      sanitizedLoc.recommendedDuration = sanitizeString(loc.recommendedDuration);
    }

    sanitizedLocations.push(sanitizedLoc);
  }

  // Validate Filters (optional)
  let sanitizedFilters: TripFilters | undefined = undefined;
  if (filters) {
    if (typeof filters !== 'object') return { isValid: false, error: 'Invalid filters format' };

    sanitizedFilters = {};

    if (filters.origin !== undefined) {
        if (typeof filters.origin !== 'string') return { isValid: false, error: 'Invalid origin' };
        if (filters.origin.length > MAX_STRING_LENGTH) return { isValid: false, error: 'Origin input too long' };
        sanitizedFilters.origin = sanitizeString(filters.origin);
    }

    if (filters.budget !== undefined) {
        if (typeof filters.budget !== 'number') return { isValid: false, error: 'Invalid budget' };
        sanitizedFilters.budget = filters.budget;
    }

    if (filters.exclusions !== undefined) {
        if (!Array.isArray(filters.exclusions)) return { isValid: false, error: 'Exclusions must be an array' };
        if (filters.exclusions.length > 20) return { isValid: false, error: 'Too many exclusions' };

        try {
            sanitizedFilters.exclusions = filters.exclusions.map((s: any) => {
                if (typeof s !== 'string') throw new Error('Invalid exclusion item');
                if (s.length > MAX_STRING_LENGTH) throw new Error('Exclusion item too long');
                return sanitizeString(s);
            });
        } catch (e) {
            return { isValid: false, error: e instanceof Error ? e.message : 'Invalid exclusion item' };
        }
    }

    if (filters.styles !== undefined) {
        if (!Array.isArray(filters.styles)) return { isValid: false, error: 'Styles must be an array' };
        if (filters.styles.length > 20) return { isValid: false, error: 'Too many styles' };

        try {
            sanitizedFilters.styles = filters.styles.map((s: any) => {
                if (typeof s !== 'string') throw new Error('Invalid style item');
                if (s.length > MAX_STRING_LENGTH) throw new Error('Style item too long');
                return sanitizeString(s);
            });
        } catch (e) {
             return { isValid: false, error: e instanceof Error ? e.message : 'Invalid style item' };
        }
    }
  }

  return {
    isValid: true,
    sanitizedBody: {
      locations: sanitizedLocations,
      tripDuration,
      filters: sanitizedFilters
    }
  };
}
