// Rapid API (Kiwi.com) interfaces
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

// TravelPayouts API interfaces
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
