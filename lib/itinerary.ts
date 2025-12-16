'use client'

import type { Destination } from './generateDestinationInfo'

export interface TimeSlotActivity {
  activity: string
  description: string
}

export interface GeneratedDay {
  dayNumber: number
  location: string
  morning: TimeSlotActivity
  midday: TimeSlotActivity
  evening: TimeSlotActivity
}

export interface Itinerary {
  id: string
  name: string
  createdAt: number
  destinations: Destination[]
  tripDuration: number | null
  generatedPlan: GeneratedDay[] | null
  vibe: string
}

const STORAGE_KEY = 'vibegetaway-itineraries'
const ACTIVE_ITINERARY_KEY = 'vibegetaway-active-itinerary'
const OLD_STORAGE_KEY = 'best-trip-itinerary'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function getAllItineraries(): Itinerary[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      migrateOldItinerary()
      const newStored = localStorage.getItem(STORAGE_KEY)
      return newStored ? JSON.parse(newStored) : []
    }
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error reading itineraries:', error)
    return []
  }
}

function migrateOldItinerary(): void {
  if (typeof window === 'undefined') return

  try {
    const oldStored = localStorage.getItem(OLD_STORAGE_KEY)
    if (!oldStored) return

    const oldItems = JSON.parse(oldStored)
    if (!Array.isArray(oldItems) || oldItems.length === 0) return

    const destinations: Destination[] = oldItems.map((item: any) => item.destination)

    const migratedItinerary: Itinerary = {
      id: generateId(),
      name: 'My Trip',
      createdAt: Date.now(),
      destinations,
      tripDuration: null,
      generatedPlan: null,
      vibe: '',
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify([migratedItinerary]))
    localStorage.setItem(ACTIVE_ITINERARY_KEY, migratedItinerary.id)
    localStorage.removeItem(OLD_STORAGE_KEY)

    console.log('Migrated old itinerary to new format')
  } catch (error) {
    console.error('Error migrating old itinerary:', error)
  }
}

export function getActiveItineraryId(): string | null {
  if (typeof window === 'undefined') return null

  try {
    return localStorage.getItem(ACTIVE_ITINERARY_KEY)
  } catch (error) {
    console.error('Error reading active itinerary ID:', error)
    return null
  }
}

export function setActiveItineraryId(id: string): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(ACTIVE_ITINERARY_KEY, id)
    window.dispatchEvent(new CustomEvent('itineraryUpdated'))
  } catch (error) {
    console.error('Error setting active itinerary ID:', error)
  }
}

export function getActiveItinerary(): Itinerary | null {
  const itineraries = getAllItineraries()
  const activeId = getActiveItineraryId()

  if (activeId) {
    const active = itineraries.find(it => it.id === activeId)
    if (active) return active
  }

  if (itineraries.length > 0) {
    setActiveItineraryId(itineraries[0].id)
    return itineraries[0]
  }

  return null
}

export function getItineraryById(id: string): Itinerary | null {
  const itineraries = getAllItineraries()
  return itineraries.find(it => it.id === id) || null
}

export function createItinerary(name: string, vibe: string = ''): Itinerary {
  if (typeof window === 'undefined') {
    return {
      id: generateId(),
      name,
      createdAt: Date.now(),
      destinations: [],
      tripDuration: null,
      generatedPlan: null,
      vibe,
    }
  }

  try {
    const itineraries = getAllItineraries()

    const newItinerary: Itinerary = {
      id: generateId(),
      name,
      createdAt: Date.now(),
      destinations: [],
      tripDuration: null,
      generatedPlan: null,
      vibe,
    }

    itineraries.unshift(newItinerary)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itineraries))
    localStorage.setItem(ACTIVE_ITINERARY_KEY, newItinerary.id)

    window.dispatchEvent(new CustomEvent('itineraryUpdated'))

    return newItinerary
  } catch (error) {
    console.error('Error creating itinerary:', error)
    return {
      id: generateId(),
      name,
      createdAt: Date.now(),
      destinations: [],
      tripDuration: null,
      generatedPlan: null,
      vibe,
    }
  }
}

export function updateItinerary(id: string, updates: Partial<Omit<Itinerary, 'id' | 'createdAt'>>): Itinerary | null {
  if (typeof window === 'undefined') return null

  try {
    const itineraries = getAllItineraries()
    const index = itineraries.findIndex(it => it.id === id)

    if (index === -1) return null

    itineraries[index] = {
      ...itineraries[index],
      ...updates,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(itineraries))
    window.dispatchEvent(new CustomEvent('itineraryUpdated'))

    return itineraries[index]
  } catch (error) {
    console.error('Error updating itinerary:', error)
    return null
  }
}

export function deleteItinerary(id: string): void {
  if (typeof window === 'undefined') return

  try {
    const itineraries = getAllItineraries()
    const filtered = itineraries.filter(it => it.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))

    const activeId = getActiveItineraryId()
    if (activeId === id && filtered.length > 0) {
      localStorage.setItem(ACTIVE_ITINERARY_KEY, filtered[0].id)
    } else if (filtered.length === 0) {
      localStorage.removeItem(ACTIVE_ITINERARY_KEY)
    }

    window.dispatchEvent(new CustomEvent('itineraryUpdated'))
  } catch (error) {
    console.error('Error deleting itinerary:', error)
  }
}

export function addDestinationToItinerary(itineraryId: string, destination: Destination): Itinerary | null {
  if (typeof window === 'undefined') return null

  try {
    const itinerary = getItineraryById(itineraryId)
    if (!itinerary) return null

    const exists = itinerary.destinations.some(
      d => d.region === destination.region && d.country === destination.country
    )

    if (exists) {
      console.log('Destination already in itinerary')
      return itinerary
    }

    const updatedDestinations = [...itinerary.destinations, destination]
    return updateItinerary(itineraryId, { destinations: updatedDestinations })
  } catch (error) {
    console.error('Error adding destination to itinerary:', error)
    return null
  }
}

export function removeDestinationFromItinerary(itineraryId: string, destination: Destination): Itinerary | null {
  if (typeof window === 'undefined') return null

  try {
    const itinerary = getItineraryById(itineraryId)
    if (!itinerary) return null

    const updatedDestinations = itinerary.destinations.filter(
      d => !(d.region === destination.region && d.country === destination.country)
    )

    return updateItinerary(itineraryId, { destinations: updatedDestinations })
  } catch (error) {
    console.error('Error removing destination from itinerary:', error)
    return null
  }
}

export function setGeneratedPlan(itineraryId: string, plan: GeneratedDay[], duration: number): Itinerary | null {
  return updateItinerary(itineraryId, {
    generatedPlan: plan,
    tripDuration: duration,
  })
}

export function clearGeneratedPlan(itineraryId: string): Itinerary | null {
  return updateItinerary(itineraryId, {
    generatedPlan: null,
    tripDuration: null,
  })
}

export function isDestinationInActiveItinerary(destination: Destination): boolean {
  const itinerary = getActiveItinerary()
  if (!itinerary) return false

  return itinerary.destinations.some(
    d => d.region === destination.region && d.country === destination.country
  )
}

export function addToActiveItinerary(destination: Destination): Itinerary | null {
  let itinerary = getActiveItinerary()

  if (!itinerary) {
    itinerary = createItinerary('My Trip')
  }

  return addDestinationToItinerary(itinerary.id, destination)
}

export function removeFromActiveItinerary(destination: Destination): Itinerary | null {
  const itinerary = getActiveItinerary()
  if (!itinerary) return null

  return removeDestinationFromItinerary(itinerary.id, destination)
}

export function getActiveItineraryDestinationCount(): number {
  const itinerary = getActiveItinerary()
  return itinerary?.destinations.length ?? 0
}

export function suggestTripDuration(destinations: Destination[]): number {
  if (destinations.length === 0) return 7

  let totalDays = 0
  destinations.forEach(dest => {
    const recommended = parseInt(dest.recommendedDuration || '3', 10)
    totalDays += isNaN(recommended) ? 3 : recommended
  })

  totalDays += Math.max(0, destinations.length - 1)

  return Math.max(7, Math.min(totalDays, 30))
}

export function formatAddedDate(timestamp: number): string {
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
