'use client'

import type { Destination } from './generateDestinationInfo'

export interface FavoriteItem {
  id: string
  destination: Destination
  addedAt: number
}

const STORAGE_KEY = 'best-trip-favorites'
const MAX_FAVORITES_ITEMS = 100

/**
 * Get all favorites from local storage
 */
export function getFavorites(): FavoriteItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const favorites: FavoriteItem[] = JSON.parse(stored)
    return favorites.sort((a, b) => b.addedAt - a.addedAt) // Most recent first
  } catch (error) {
    console.error('Error reading favorites:', error)
    return []
  }
}

/**
 * Add a destination to favorites
 */
export function addToFavorites(destination: Destination): FavoriteItem {
  if (typeof window === 'undefined') {
    return { id: '', destination, addedAt: Date.now() }
  }
  
  try {
    const favorites = getFavorites()
    
    // Check if this destination already exists (same region and country)
    const existingIndex = favorites.findIndex(
      item => item.destination.region === destination.region && 
              item.destination.country === destination.country
    )
    
    // If exists, don't add duplicate
    if (existingIndex !== -1) {
      console.log('Destination already in favorites')
      return favorites[existingIndex]
    }
    
    const newItem: FavoriteItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      destination,
      addedAt: Date.now(),
    }
    
    // Add to beginning of array
    favorites.unshift(newItem)
    
    // Keep only MAX_FAVORITES_ITEMS most recent
    const trimmedFavorites = favorites.slice(0, MAX_FAVORITES_ITEMS)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedFavorites))
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: trimmedFavorites }))
    
    return newItem
  } catch (error) {
    console.error('Error adding to favorites:', error)
    return { id: '', destination, addedAt: Date.now() }
  }
}

/**
 * Remove a destination from favorites
 */
export function removeFromFavorites(id: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const favorites = getFavorites()
    const filtered = favorites.filter(item => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: filtered }))
  } catch (error) {
    console.error('Error removing from favorites:', error)
  }
}

/**
 * Clear all favorites
 */
export function clearFavorites(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(STORAGE_KEY)
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: [] }))
  } catch (error) {
    console.error('Error clearing favorites:', error)
  }
}

/**
 * Get favorites count
 */
export function getFavoritesCount(): number {
  return getFavorites().length
}

/**
 * Check if a destination is in favorites
 */
export function isInFavorites(destination: Destination): boolean {
  const favorites = getFavorites()
  return favorites.some(
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

