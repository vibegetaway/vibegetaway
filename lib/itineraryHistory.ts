'use client'

import type { Destination } from './generateDestinationInfo'

export interface DayActivity {
  activity: string
  description: string
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
