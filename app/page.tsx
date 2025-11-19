'use client'

import { AnimatedVibeInput } from '@/components/AnimatedVibeInput'
import { MonthSelect } from '@/components/MonthSelect'
import { LeftSidebar } from '@/components/LeftSidebar'
import { RecentSearchPanel } from '@/components/RecentSearchPanel'
import { SearchResultsPanel } from '@/components/SearchResultsPanel'
import { ItineraryPanel } from '@/components/ItineraryPanel'
import { FavoritesPanel } from '@/components/FavoritesPanel'
import WorldMap from '@/components/WorldMap'
import { useState, useEffect, useRef } from 'react'
import { fetchDestinationsWithDetails } from '@/lib/fetchDestinations'
import type { Destination } from '@/lib/generateDestinationInfo'
import { saveSearchToHistory, type SearchHistoryItem } from '@/lib/searchHistory'
import mockDestinations from '@/data/mock-gemini-response.json'

const isDev = process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev-local'

// Number of destinations to fetch in parallel per batch
const BATCH_SIZE = 5

export default function Home() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(false)
  const [vibe, setVibe] = useState(isDev ? 'climb' : '')
  const [month, setMonth] = useState(isDev ? 'November' : '')
  const [activePanel, setActivePanel] = useState<'none' | 'search' | 'recent' | 'itinerary' | 'favorites'>('none')
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)

  // Ensure only the latest async call updates state
  const callIdRef = useRef(0)

  // Track if we should save to history (don't save when loading from history)
  const shouldSaveToHistory = useRef(true)

  const handleFindDestinations = async (v: string, m: string) => {
    if (!v.trim() || !m) {
      return
    }

    const callId = ++callIdRef.current
    setLoading(true)
    setDestinations([])

    try {
      await fetchDestinationsWithDetails({
        batchSize: BATCH_SIZE,
        params: {
          vibe: v,
          timePeriod: m,
        },
        callbacks: {
          onInitialDestinations: (destinations) => {
            // Ignore if a newer call started
            if (callId !== callIdRef.current) {
              return
            }

            setDestinations(destinations)
            setLoading(false)
          },
          onBatchComplete: (updatedDestinations) => {
            // Ignore if a newer call started
            if (callId !== callIdRef.current) {
              return
            }

            setDestinations(updatedDestinations)
          },
          onComplete: () => {
            console.log('[INFO] All destination details loaded')

            // Save to history only if this was a new search (not loaded from history)
            if (shouldSaveToHistory.current && callId === callIdRef.current) {
              // Get the final destinations state
              setDestinations(prev => {
                saveSearchToHistory(v, m, prev)
                return prev
              })
            }
          },
          onError: (error) => {
            console.error('[ERROR] Callback onError:', error.message)
            if (callId === callIdRef.current) setLoading(false)
          },
        },
      })
    } catch (err) {
      console.error('[ERROR] handleFindDestinations catch:', err instanceof Error ? err.message : 'An error occurred')
      if (callId === callIdRef.current) setLoading(false)
    }
  }

  // Handler for loading a search from history
  const handleSearchFromHistory = (item: SearchHistoryItem) => {
    console.log('[INFO] Loading search from history:', item)

    // Don't save this back to history
    shouldSaveToHistory.current = false

    // Set the search params
    setVibe(item.vibe)
    setMonth(item.timePeriod)

    // If we have cached destinations, use them immediately
    if (item.destinations && item.destinations.length > 0) {
      console.log('[INFO] Using cached destinations from history:', item.destinations.length)
      setDestinations(item.destinations)
      setLoading(false)
    } else {
      // Otherwise fetch fresh data
      console.log('[INFO] No cached destinations, fetching fresh data')
      handleFindDestinations(item.vibe, item.timePeriod)
    }

    // Re-enable saving for future searches
    setTimeout(() => {
      shouldSaveToHistory.current = true
    }, 100)
  }

  // Load mock data in dev mode on initial mount
  useEffect(() => {
    if (isDev) {
      console.log('[DEV MODE] Loading pre-loaded mock data:', mockDestinations)
      setDestinations(mockDestinations as Destination[])
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle keyboard shortcut (Cmd+Enter / Ctrl+Enter) to trigger search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        if (vibe.trim() && month) {
          console.log('[INFO] Keyboard shortcut triggered search')
          handleFindDestinations(vibe, month)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vibe, month])

  // Auto-open search panel when destinations are loaded
  useEffect(() => {
    if (destinations.length > 0) {
      setActivePanel('search')
    }
  }, [destinations])

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <LeftSidebar
        onRecentClick={() => setActivePanel(prev => prev === 'recent' ? 'none' : 'recent')}
        onSearchClick={() => setActivePanel(prev => prev === 'search' ? 'none' : 'search')}
        onItineraryClick={() => setActivePanel(prev => prev === 'itinerary' ? 'none' : 'itinerary')}
        onFavoritesClick={() => setActivePanel(prev => prev === 'favorites' ? 'none' : 'favorites')}
      />
      <RecentSearchPanel
        isOpen={activePanel === 'recent'}
        onClose={() => setActivePanel('none')}
        onSearchSelect={handleSearchFromHistory}
      />
      <SearchResultsPanel
        destinations={destinations}
        loading={loading}
        onDestinationClick={setSelectedDestination}
        selectedDestination={selectedDestination}
        isOpen={activePanel === 'search'}
        onClose={() => setActivePanel('none')}
      />
      <ItineraryPanel
        isOpen={activePanel === 'itinerary'}
        onClose={() => setActivePanel('none')}
        onDestinationClick={setSelectedDestination}
        selectedDestination={selectedDestination}
      />
      <FavoritesPanel
        isOpen={activePanel === 'favorites'}
        onClose={() => setActivePanel('none')}
        onDestinationClick={setSelectedDestination}
        selectedDestination={selectedDestination}
      />
      <div className="absolute top-4 left-24 z-20 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 flex items-center gap-4">
        <h1 className="text-xl font-bold leading-tight">
          <span className="text-foreground">I want to </span>
          <span className="inline-block align-middle">
            <AnimatedVibeInput value={vibe} onChange={setVibe} />
          </span>
          <span className="text-foreground"> in </span>
          <span className="inline-block align-middle">
            <MonthSelect value={month} onChange={setMonth} />
          </span>
        </h1>
        <button
          type="button"
          onClick={() => vibe.trim() && month && handleFindDestinations(vibe, month)}
          disabled={!vibe.trim() || !month}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 bg-amber-100/50 hover:bg-amber-200/60 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-sm font-bold text-amber-800">search</span>
          <span className="text-[10px] font-mono text-amber-700/60">⌘ ↵</span>
        </button>
      </div>
      <WorldMap
        loading={loading}
        destinations={destinations}
        selectedDestination={selectedDestination}
        onDestinationSelect={setSelectedDestination}
        isSidebarOpen={activePanel !== 'none'}
      />
    </main>
  )
}
