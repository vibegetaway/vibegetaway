export interface UserLocation {
  city?: string
  country: string
  countryCode?: string
}

export async function getUserLocation(): Promise<UserLocation | null> {
  try {
    const response = await fetch('https://get.geojs.io/v1/ip/geo.json')
    
    if (!response.ok) {
      throw new Error(`Failed to fetch location: ${response.status}`)
    }
    
    const data = await response.json()
    
    return {
      city: data.city,
      country: data.country,
      countryCode: data.country_code
    }
  } catch (error) {
    console.error('Error fetching user location from geojs.io:', error)
    
    try {
      const fallbackResponse = await fetch('https://ipwho.is/')
      
      if (!fallbackResponse.ok) {
        throw new Error(`Fallback fetch failed: ${fallbackResponse.status}`)
      }
      
      const fallbackData = await fallbackResponse.json()
      
      if (!fallbackData.success) {
        throw new Error('Fallback location lookup failed')
      }
      
      return {
        city: fallbackData.city,
        country: fallbackData.country,
        countryCode: fallbackData.country_code
      }
    } catch (fallbackError) {
      console.error('Fallback location service also failed:', fallbackError)
      return null
    }
  }
}

export function formatLocationString(location: UserLocation): string {
  return location.country
}
