'use client'

import type { Destination } from './generateDestinationInfo'

export interface ItineraryItem {
  id: string
  destination: Destination
  addedAt: number
}

const STORAGE_KEY = 'best-trip-itinerary'
const MAX_ITINERARY_ITEMS = 50

/**
 * Get all itinerary items from local storage
 */
export function getItinerary(): ItineraryItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const itinerary: ItineraryItem[] = JSON.parse(stored)
    return itinerary.sort((a, b) => b.addedAt - a.addedAt) // Most recent first
  } catch (error) {
    console.error('Error reading itinerary:', error)
    return []
  }
}

/**
 * Add a destination to itinerary
 */
export function addToItinerary(destination: Destination): ItineraryItem {
  if (typeof window === 'undefined') {
    return { id: '', destination, addedAt: Date.now() }
  }
  
  try {
    const itinerary = getItinerary()
    
    // Check if this destination already exists (same region and country)
    const existingIndex = itinerary.findIndex(
      item => item.destination.region === destination.region && 
              item.destination.country === destination.country
    )
    
    // If exists, don't add duplicate
    if (existingIndex !== -1) {
      console.log('Destination already in itinerary')
      return itinerary[existingIndex]
    }
    
    const newItem: ItineraryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      destination,
      addedAt: Date.now(),
    }
    
    // Add to beginning of array
    itinerary.unshift(newItem)
    
    // Keep only MAX_ITINERARY_ITEMS most recent
    const trimmedItinerary = itinerary.slice(0, MAX_ITINERARY_ITEMS)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedItinerary))
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('itineraryUpdated', { detail: trimmedItinerary }))
    
    return newItem
  } catch (error) {
    console.error('Error adding to itinerary:', error)
    return { id: '', destination, addedAt: Date.now() }
  }
}

/**
 * Remove a destination from itinerary
 */
export function removeFromItinerary(id: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const itinerary = getItinerary()
    const filtered = itinerary.filter(item => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('itineraryUpdated', { detail: filtered }))
  } catch (error) {
    console.error('Error removing from itinerary:', error)
  }
}

/**
 * Clear all itinerary items
 */
export function clearItinerary(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(STORAGE_KEY)
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('itineraryUpdated', { detail: [] }))
  } catch (error) {
    console.error('Error clearing itinerary:', error)
  }
}

/**
 * Get itinerary count
 */
export function getItineraryCount(): number {
  return getItinerary().length
}

/**
 * Check if a destination is in the itinerary
 */
export function isInItinerary(destination: Destination): boolean {
  const itinerary = getItinerary()
  return itinerary.some(
    item => item.destination.region === destination.region && 
            item.destination.country === destination.country
  )
}

/**
 * Format timestamp for display
 */
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

