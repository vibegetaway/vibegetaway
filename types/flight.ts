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
