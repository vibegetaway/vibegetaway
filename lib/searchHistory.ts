'use client'

import type { Destination } from './generateDestinationInfo'

export interface SearchHistoryItem {
  id: string
  vibe: string
  timePeriod: string
  timestamp: number
  destinations?: Destination[]
  filters?: {
    origin?: string
    destinations?: string[]
    duration?: [number, number]
    budget?: number
    exclusions?: string[]
    styles?: string[]
  }
}

const STORAGE_KEY = 'best-trip-search-history'
const MAX_HISTORY_ITEMS = 20

/**
 * Get all search history from local storage
 */
export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const history: SearchHistoryItem[] = JSON.parse(stored)
    return history.sort((a, b) => b.timestamp - a.timestamp) // Most recent first
  } catch (error) {
    console.error('Error reading search history:', error)
    return []
  }
}

/**
 * Save a search to history
 */
export function saveSearchToHistory(
  vibe: string,
  timePeriod: string,
  destinations?: Destination[],
  filters?: SearchHistoryItem['filters']
): SearchHistoryItem {
  if (typeof window === 'undefined') {
    return { id: '', vibe, timePeriod, timestamp: Date.now() }
  }

  try {
    const history = getSearchHistory()

    // Check if this exact search already exists (same vibe and timePeriod)
    // We'll treat it as new if filters are different, or just update the timestamp
    const existingIndex = history.findIndex(
      item => item.vibe === vibe &&
        item.timePeriod === timePeriod &&
        JSON.stringify(item.filters) === JSON.stringify(filters)
    )

    const newItem: SearchHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      vibe,
      timePeriod,
      timestamp: Date.now(),
      destinations,
      filters
    }

    // If exists, remove the old one (we'll add updated one at the top)
    if (existingIndex !== -1) {
      history.splice(existingIndex, 1)
    }

    // Add to beginning of array
    history.unshift(newItem)

    // Keep only MAX_HISTORY_ITEMS most recent
    const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory))

    return newItem
  } catch (error) {
    console.error('Error saving search history:', error)
    return { id: '', vibe, timePeriod, timestamp: Date.now() }
  }
}

/**
 * Clear all search history
 */
export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing search history:', error)
  }
}

/**
 * Delete a specific search from history
 */
export function deleteSearchFromHistory(id: string): void {
  if (typeof window === 'undefined') return

  try {
    const history = getSearchHistory()
    const filtered = history.filter(item => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error deleting search from history:', error)
  }
}

/**
 * Format search text for display
 */
export function formatSearchText(vibe: string, timePeriod: string): string {
  return `I want to ${vibe} in ${timePeriod}`
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
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

