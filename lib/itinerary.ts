'use client'

import type { Destination } from './generateDestinationInfo'

const STORAGE_KEY = 'vibegetaway-saved-locations'

export function getSavedLocations(): Destination[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading saved locations:', error)
    return []
  }
}

function saveSavedLocations(locations: Destination[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations))
    window.dispatchEvent(new CustomEvent('locationsUpdated'))
  } catch (error) {
    console.error('Error saving locations:', error)
  }
}

export function isDestinationSaved(destination: Destination): boolean {
  const locations = getSavedLocations()
  return locations.some(
    d => d.region === destination.region && d.country === destination.country
  )
}

export function addToSavedLocations(destination: Destination): void {
  const locations = getSavedLocations()
  
  const exists = locations.some(
    d => d.region === destination.region && d.country === destination.country
  )

  if (exists) {
    console.log('Location already saved')
    return
  }

  locations.push(destination)
  saveSavedLocations(locations)
}

export function removeFromSavedLocations(destination: Destination): void {
  const locations = getSavedLocations()
  
  const filtered = locations.filter(
    d => !(d.region === destination.region && d.country === destination.country)
  )

  saveSavedLocations(filtered)
}

export function getSavedLocationsCount(): number {
  return getSavedLocations().length
}
