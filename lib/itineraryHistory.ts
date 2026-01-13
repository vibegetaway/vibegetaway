'use client'

import type { Destination } from '@/types/destination'

export interface DayActivity {
  activity: string
  description: string
  imageUrl?: string
  imageUrls?: string[]
}

export interface DayBreakdown {
  day: number
  location: string
  coordinates?: {
    lat: number
    lng: number
  }
  best_time_to_visit?: string
  why_its_nice?: string
  events?: Array<{
    name: string
    description: string
  }>
  alerts?: Array<{
    type: 'warning' | 'info'
    message: string
  }>
  points_of_interest?: Array<{
    name: string
    description: string
    insight?: string
    tags?: string[]
    cost?: string
    duration?: string
    coordinates: {
      lat: number
      lng: number
    }
  }>
  morning: DayActivity
  midday: DayActivity
  evening: DayActivity
}

export interface SavedItinerary {
  id: string
  name: string
  timestamp: number
  locations: Destination[]
  tripDuration: number
  generatedPlan: DayBreakdown[]
}

const STORAGE_KEY = 'vibegetaway-itinerary-history'
const MAX_HISTORY = 20

export function getItineraryHistory(): SavedItinerary[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading itinerary history:', error)
    return []
  }
}

export function getItineraryById(id: string): SavedItinerary | null {
  if (typeof window === 'undefined') return null

  try {
    const history = getItineraryHistory()
    return history.find(itinerary => itinerary.id === id) || null
  } catch (error) {
    console.error('Error reading itinerary by ID:', error)
    return null
  }
}

function generateSimpleId(): string {
  // Generate a simple 6-character alphanumeric ID
  return Math.random().toString(36).substring(2, 8).toLowerCase()
}

export function saveItineraryToHistory(
  locations: Destination[],
  tripDuration: number,
  generatedPlan: DayBreakdown[],
  name: string
): string {
  if (typeof window === 'undefined') return ''

  try {
    const history = getItineraryHistory()
    const simpleId = generateSimpleId()

    const newItinerary: SavedItinerary = {
      id: simpleId,
      name,
      timestamp: Date.now(),
      locations,
      tripDuration,
      generatedPlan,
    }

    history.unshift(newItinerary)

    if (history.length > MAX_HISTORY) {
      history.splice(MAX_HISTORY)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    return simpleId
  } catch (error) {
    console.error('Error saving itinerary to history:', error)
    return ''
  }
}

export function deleteItineraryFromHistory(id: string): void {
  if (typeof window === 'undefined') return

  try {
    const history = getItineraryHistory()
    const filtered = history.filter(item => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error deleting itinerary from history:', error)
  }
}

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return days === 1 ? '1 day ago' : `${days} days ago`
  }
  if (hours > 0) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`
  }
  if (minutes > 0) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`
  }
  return 'Just now'
}

export interface QuickstartActivity {
  title: string
  description: string
  reason: string
  imageUrl?: string
  imageUrls?: string[]
}

export interface QuickstartItinerary {
  morning: QuickstartActivity
  midday: QuickstartActivity
  evening: QuickstartActivity
}

function parseLocation(locationString: string): { region: string; country: string } {
  const parts = locationString.split(',').map(s => s.trim())
  
  if (parts.length >= 2) {
    return {
      region: parts[0],
      country: parts[parts.length - 1]
    }
  }
  
  return {
    region: locationString,
    country: ''
  }
}

export function saveQuickstartToHistory(
  itinerary: QuickstartItinerary,
  activity: string,
  location: string
): string {
  if (typeof window === 'undefined') return ''

  try {
    const { region, country } = parseLocation(location)
    
    const tripName = activity 
      ? `${activity.charAt(0).toUpperCase() + activity.slice(1)} in ${region}`
      : `Day in ${location}`

    const locationData: Destination = {
      country,
      region
    }

    const dayBreakdown: DayBreakdown = {
      day: 1,
      location: location,
      morning: {
        activity: itinerary.morning.title,
        description: `${itinerary.morning.description} ${itinerary.morning.reason}`,
        imageUrl: itinerary.morning.imageUrl,
        imageUrls: itinerary.morning.imageUrls
      },
      midday: {
        activity: itinerary.midday.title,
        description: `${itinerary.midday.description} ${itinerary.midday.reason}`,
        imageUrl: itinerary.midday.imageUrl,
        imageUrls: itinerary.midday.imageUrls
      },
      evening: {
        activity: itinerary.evening.title,
        description: `${itinerary.evening.description} ${itinerary.evening.reason}`,
        imageUrl: itinerary.evening.imageUrl,
        imageUrls: itinerary.evening.imageUrls
      }
    }

    const itineraryId = saveItineraryToHistory(
      [locationData],
      1,
      [dayBreakdown],
      tripName
    )

    return itineraryId
  } catch (error) {
    console.error('Error saving quickstart to history:', error)
    return ''
  }
}

export function updateItineraryById(
  id: string,
  itinerary: QuickstartItinerary,
  activity: string,
  location: string
): void {
  if (typeof window === 'undefined') return

  try {
    const history = getItineraryHistory()
    const index = history.findIndex(item => item.id === id)
    
    if (index === -1) return

    const { region, country } = parseLocation(location)
    
    const tripName = activity 
      ? `${activity.charAt(0).toUpperCase() + activity.slice(1)} in ${region}`
      : `Day in ${location}`

    const dayBreakdown: DayBreakdown = {
      day: 1,
      location: location,
      morning: {
        activity: itinerary.morning.title,
        description: `${itinerary.morning.description} ${itinerary.morning.reason}`,
        imageUrl: itinerary.morning.imageUrl,
        imageUrls: itinerary.morning.imageUrls
      },
      midday: {
        activity: itinerary.midday.title,
        description: `${itinerary.midday.description} ${itinerary.midday.reason}`,
        imageUrl: itinerary.midday.imageUrl,
        imageUrls: itinerary.midday.imageUrls
      },
      evening: {
        activity: itinerary.evening.title,
        description: `${itinerary.evening.description} ${itinerary.evening.reason}`,
        imageUrl: itinerary.evening.imageUrl,
        imageUrls: itinerary.evening.imageUrls
      }
    }

    history[index] = {
      ...history[index],
      name: tripName,
      generatedPlan: [dayBreakdown],
      locations: [{ country, region }]
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Error updating itinerary:', error)
  }
}

