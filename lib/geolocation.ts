export interface UserLocation {
  city?: string
  country: string
  countryCode?: string
}

export async function getUserLocation(): Promise<UserLocation | null> {
  try {
    const response = await fetch('https://ipapi.co/json/')
    
    if (!response.ok) {
      throw new Error('Failed to fetch location')
    }
    
    const data = await response.json()
    
    return {
      city: data.city,
      country: data.country_name,
      countryCode: data.country_code
    }
  } catch (error) {
    console.error('Error fetching user location:', error)
    return {
      country: 'United States',
      countryCode: 'US'
    }
  }
}

export function formatLocationString(location: UserLocation): string {
  if (location.city) {
    return `${location.city}, ${location.country}`
  }
  return location.country
}
