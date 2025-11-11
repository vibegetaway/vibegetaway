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
  stopover: {
    nightsCount: number
    duration: number
  }
}

export interface RapidApiResponse {
  itineraries: RapidApiFlight[]
}

// Intermediate stop information
export interface FlightStop {
  code: string
  name: string
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
  originName: string
  destination: string
  destinationName: string
  duration: number // Total duration in minutes
  outboundDuration: number // Outbound duration in minutes
  inboundDuration: number // Return duration in minutes
  outboundTransfers: number
  inboundTransfers: number
  transfers: number // Total transfers
  outboundStops: FlightStop[] // Intermediate stops for outbound
  inboundStops: FlightStop[] // Intermediate stops for return
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
    const destination = destinationCode ? `Airport:${destinationCode}` : 'City:barcelona_es'

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
      // Get first segment for origin and departure time
      const outboundFirstSegment = flight.outbound.sectorSegments[0]?.segment
      const inboundFirstSegment = flight.inbound.sectorSegments[0]?.segment
      
      // Get last segment for final destination and arrival time
      const outboundLastSegment = flight.outbound.sectorSegments[flight.outbound.sectorSegments.length - 1]?.segment
      const inboundLastSegment = flight.inbound.sectorSegments[flight.inbound.sectorSegments.length - 1]?.segment
      
      // Calculate transfers (number of segments - 1 for each direction)
      const outboundTransfers = Math.max(0, flight.outbound.sectorSegments.length - 1)
      const inboundTransfers = Math.max(0, flight.inbound.sectorSegments.length - 1)
      const totalTransfers = outboundTransfers + inboundTransfers

      // Extract intermediate stops for outbound (all segments except first and last)
      const outboundStops: FlightStop[] = []
      if (flight.outbound.sectorSegments.length > 1) {
        // Intermediate stops are the destinations of segments (except the last one)
        for (let i = 0; i < flight.outbound.sectorSegments.length - 1; i++) {
          const stop = flight.outbound.sectorSegments[i].segment.destination.station
          outboundStops.push({
            code: stop.code,
            name: stop.name
          })
        }
      }

      // Extract intermediate stops for inbound (all segments except first and last)
      const inboundStops: FlightStop[] = []
      if (flight.inbound.sectorSegments.length > 1) {
        // Intermediate stops are the destinations of segments (except the last one)
        for (let i = 0; i < flight.inbound.sectorSegments.length - 1; i++) {
          const stop = flight.inbound.sectorSegments[i].segment.destination.station
          inboundStops.push({
            code: stop.code,
            name: stop.name
          })
        }
      }

      // API returns duration in minutes (typical for flight APIs)
      // If value seems too large (> 2000), it might be in seconds, so convert
      // Otherwise use as-is (already in minutes)
      const outboundDurationMinutes = flight.outbound.duration > 2000
        ? Math.round(flight.outbound.duration / 60)
        : Math.round(flight.outbound.duration)
      const inboundDurationMinutes = flight.inbound.duration > 2000
        ? Math.round(flight.inbound.duration / 60)
        : Math.round(flight.inbound.duration)
      const totalDurationMinutes = outboundDurationMinutes + inboundDurationMinutes

      // Get booking URL (prefer first booking option)
      const bookingUrl = flight.bookingOptions.edges[0]?.node.bookingUrl || ''

      return {
        id: flight.id,
        price: parseFloat(flight.price.amount),
        currency: 'EUR',
        departure_at: outboundFirstSegment.source.localTime,
        return_at: inboundLastSegment.destination.localTime,
        airline: outboundFirstSegment.carrier.code,
        origin: outboundFirstSegment.source.station.code,
        originName: outboundFirstSegment.source.station.name,
        destination: outboundLastSegment.destination.station.code,
        destinationName: outboundLastSegment.destination.station.name,
        duration: totalDurationMinutes,
        outboundDuration: outboundDurationMinutes,
        inboundDuration: inboundDurationMinutes,
        outboundTransfers,
        inboundTransfers,
        transfers: totalTransfers,
        outboundStops,
        inboundStops,
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

