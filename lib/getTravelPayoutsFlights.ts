'use server'

// TypeScript interfaces for TravelPayouts API responses
export interface Flight {
  flight_number: string
  link: string
  origin_airport: string
  destination_airport: string
  departure_at: string
  return_at: string
  airline: string
  destination: string
  origin: string
  price: number
  return_transfers: number
  duration: number
  duration_to: number
  duration_back: number
  transfers: number
}

export interface FlightSearchResponse {
  data: Flight[]
  currency: string
  success: boolean
}

export interface AffiliateLinkRequest {
  trs: number
  marker: number
  shorten: boolean
  links: Array<{ url: string }>
}

export interface AffiliateLinkResult {
  url: string
  code: string
  partner_url: string
  campaign_id: number
}

export interface AffiliateLinkResponse {
  result: {
    trs: number
    marker: number
    shorten: boolean
    links: AffiliateLinkResult[]
  }
  code: string
  status: number
}

/**
 * Fetches top 3 flights from TravelPayouts API
 * Hardcoded: origin=AMS, dates=2025-12
 * @param destinationCode - IATA airport code for destination (defaults to 'BCN')
 */
export async function fetchFlights(destinationCode?: string): Promise<Flight[]> {
  try {
    const apiKey = process.env.TRAVEL_PAYOUT_API_KEY
    
    if (!apiKey) {
      console.error('TRAVEL_PAYOUT_API_KEY environment variable is not set')
      return []
    }

    // Use provided destination code or default to BCN
    const destination = destinationCode || 'UTP'

    // Hardcoded parameters as specified
    const params = new URLSearchParams({
      origin: 'AMS',
      destination: destination,
      departure_at: '2025-11',
      currency: 'eur',
      limit: '3',
      one_way: 'false',
      token: apiKey
    })

    const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${params.toString()}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`TravelPayouts API error: ${response.status} ${response.statusText}`)
    }

    const data: FlightSearchResponse = await response.json()

    if (!data.success || !data.data) {
      console.error('TravelPayouts API returned unsuccessful response')
      return []
    }

    return data.data
  } catch (error) {
    console.error('Error fetching flights from TravelPayouts:', error)
    return []
  }
}

/**
 * Creates an affiliate link for a flight
 * @param flightLink - The link from the flight API response
 * @returns The shortened affiliate partner URL
 */
export async function createAffiliateLink(flightLink: string): Promise<string | null> {
  try {
    const apiKey = process.env.TRAVEL_PAYOUT_API_KEY
    const markerId = process.env.TRAVEL_PAYOUT_MARKER_ID
    const trsToken = process.env.TRAVEL_PAYOUT_TRS_TOKEN

    if (!apiKey || !markerId || !trsToken) {
      console.error('TravelPayouts environment variables are not fully set')
      return null
    }

    // Construct full URL from flight link
    const fullUrl = `https://www.aviasales.com${flightLink}`

    const requestBody: AffiliateLinkRequest = {
      trs: parseInt(trsToken, 10),
      marker: parseInt(markerId, 10),
      shorten: true,
      links: [{ url: fullUrl }]
    }

    const response = await fetch('https://api.travelpayouts.com/links/v1/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': apiKey
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`Affiliate link API error: ${response.status} ${response.statusText}`)
    }

    const data: AffiliateLinkResponse = await response.json()

    if (data.code === 'success' && data.result.links.length > 0) {
      const link = data.result.links[0]
      if (link.code === 'success' && link.partner_url) {
        console.log('Affiliate link created:', link.partner_url)
        return link.partner_url
      }
    }

    console.error('Failed to create affiliate link:', data)
    return null
  } catch (error) {
    console.error('Error creating affiliate link:', error)
    return null
  }
}

