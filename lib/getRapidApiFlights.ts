'use server'

// TypeScript interfaces for Rapid API (Kiwi.com) responses
export interface RapidApiFlight {
  id: string
  price: {
    amount: string
    priceBeforeDiscount: string
  }
  priceEur: {
    amount: string
  }
  provider: {
    name: string
    code: string
  }
  bookingOptions: {
    edges: Array<{
      node: {
        bookingUrl: string
        price: {
          amount: string
        }
      }
    }>
  }
  outbound: {
    duration: number
    sectorSegments: Array<{
      segment: {
        source: {
          localTime: string
          station: {
            code: string
            name: string
          }
        }
        destination: {
          localTime: string
          station: {
            code: string
            name: string
          }
        }
        carrier: {
          code: string
          name: string
        }
      }
    }>
  }
  inbound: {
    duration: number
    sectorSegments: Array<{
      segment: {
        source: {
          localTime: string
        }
        destination: {
          localTime: string
        }
      }
    }>
  }
  stopover: {
    nightsCount: number
    duration: number
  }
}

export interface RapidApiResponse {
  itineraries: RapidApiFlight[]
}

// Simplified flight interface for the UI
export interface SimplifiedFlight {
  id: string
  price: number
  currency: string
  departure_at: string
  return_at: string
  airline: string
  origin: string
  destination: string
  duration: number
  transfers: number
  bookingUrl: string
  stayDuration: number
}

/**
 * Fetches flights from Rapid API (Kiwi.com)
 * @param originCode - Origin airport/city code (e.g., "AMS" or "City:amsterdam_nl")
 * @param destinationCode - Destination airport code (e.g., "BCN")
 * @returns Simplified flight data
 */
export async function fetchRapidApiFlights(
  originCode?: string,
  destinationCode?: string
): Promise<SimplifiedFlight[]> {
  try {
    const apiKey = process.env.RAPID_API_KEY
    
    if (!apiKey) {
      console.error('RAPID_API_KEY environment variable is not set')
      return []
    }

    // Default values
    const source = originCode || 'City:amsterdam_nl'
    const destination = destinationCode ? `airport:${destinationCode}` : 'City:barcelona_es'

    // Build query parameters
    const params = new URLSearchParams({
      source: source,
      destination: destination,
      currency: 'eur',
      locale: 'en',
      adults: '1',
      children: '0',
      infants: '0',
      handbags: '1',
      holdbags: '0',
      cabinClass: 'ECONOMY',
      sortBy: 'PRICE',
      sortOrder: 'ASCENDING',
      applyMixedClasses: 'true',
      allowReturnFromDifferentCity: 'false',
      allowChangeInboundDestination: 'false',
      allowChangeInboundSource: 'false',
      allowDifferentStationConnection: 'true',
      enableSelfTransfer: 'false',
      allowOvernightStopover: 'true',
      enableTrueHiddenCity: 'false',
      enableThrowAwayTicketing: 'false',
      outbound: 'SUNDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,MONDAY,TUESDAY',
      transportTypes: 'FLIGHT',
      contentProviders: 'KIWI',
      limit: '20'
    })

    const url = `https://kiwi-com-cheap-flights.p.rapidapi.com/round-trip?${params.toString()}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'kiwi-com-cheap-flights.p.rapidapi.com',
        'x-rapidapi-key': apiKey
      }
    })

    if (!response.ok) {
      throw new Error(`Rapid API error: ${response.status} ${response.statusText}`)
    }

    const data: RapidApiResponse = await response.json()

    if (!data.itineraries || data.itineraries.length === 0) {
      console.error('No flights found in Rapid API response')
      return []
    }

    // Transform to simplified format and take top 3
    const simplifiedFlights: SimplifiedFlight[] = data.itineraries.slice(0, 3).map((flight) => {
      const outboundSegment = flight.outbound.sectorSegments[0]?.segment
      const inboundSegment = flight.inbound.sectorSegments[0]?.segment
      
      // Calculate total transfers (number of segments - 1 for each direction)
      const outboundTransfers = Math.max(0, flight.outbound.sectorSegments.length - 1)
      const inboundTransfers = Math.max(0, flight.inbound.sectorSegments.length - 1)
      const totalTransfers = outboundTransfers + inboundTransfers

      // Get booking URL (prefer first booking option)
      const bookingUrl = flight.bookingOptions.edges[0]?.node.bookingUrl || ''

      return {
        id: flight.id,
        price: parseFloat(flight.price.amount),
        currency: 'EUR',
        departure_at: outboundSegment.source.localTime,
        return_at: inboundSegment.destination.localTime,
        airline: outboundSegment.carrier.code,
        origin: outboundSegment.source.station.code,
        destination: outboundSegment.destination.station.code,
        duration: flight.outbound.duration + flight.inbound.duration,
        transfers: totalTransfers,
        bookingUrl: `https://www.kiwi.com${bookingUrl}`,
        stayDuration: flight.stopover.nightsCount
      }
    })

    return simplifiedFlights
  } catch (error) {
    console.error('Error fetching flights from Rapid API:', error)
    return []
  }
}

