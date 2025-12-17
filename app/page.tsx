'use client'

import { SearchBar } from '@/components/user-input/SearchBar'
import { InspirationChips } from '@/components/user-input/InspirationChips'
import { LeftSidebar } from '@/components/LeftSidebar'
import { RecentSearchPanel } from '@/components/panels/RecentSearchPanel'
import { SearchResultsPanel } from '@/components/panels/SearchResultsPanel'
import { ItineraryPanel } from '@/components/panels/ItineraryPanel'
import { FilterBar } from '@/components/user-input/FilterBar'
import { FilterSidePanel } from '@/components/panels/FilterSidePanel'
import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'
import { fetchDestinationsWithDetails } from '@/lib/fetchDestinations'
import type { Destination } from '@/lib/generateDestinationInfo'
import { saveSearchToHistory, type SearchHistoryItem } from '@/lib/searchHistory'
import { cn } from '@/lib/utils'
import mockDestinations from '@/data/mock-gemini-response.json'
import { usePostHog } from 'posthog-js/react'
import type { InspirationChip } from '@/data/inspirationChips'
import { getUserLocation, formatLocationString } from '@/lib/geolocation'
import { useTripFilters } from '@/hooks/useTripFilters'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'

// Dynamic import to avoid SSR issues with Leaflet
const WorldMap = dynamic(() => import('@/components/map/WorldMap'), { ssr: false })

const isDev = process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev-local'

// Number of destinations to fetch in parallel per batch
const BATCH_SIZE = 5

export default function Home() {
  const posthog = usePostHog()
  const { isSignedIn } = useUser()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(false)
  const [vibe, setVibe] = useState(isDev ? 'climb' : '')
  const [month, setMonth] = useState(isDev ? 'November' : 'Anytime')
  const [activePanel, setActivePanel] = useState<'none' | 'search' | 'recent' | 'itinerary'>('none')
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)

  // Ensure only the latest async call updates state
  const callIdRef = useRef(0)

  // Track if we should save to history (don't save when loading from history)
  const shouldSaveToHistory = useRef(true)

  const handleFindDestinations = async (v: string, m: string) => {
    if (!v.trim()) {
      return
    }

    // Track search submission
    posthog?.capture('search_submitted', {
      vibe: v,
      month: m,
      filters: {
        origin: filters.origin,
        destinations: filters.locations,
        duration: filters.duration,
        budget: filters.budget,
        exclusions: filters.exclusions,
        styles: filters.styles,
      }
    })

    const callId = ++callIdRef.current
    setLoading(true)
    setDestinations([])
    setActivePanel('search') // Open panel immediately to show loading state

    try {
      await fetchDestinationsWithDetails({
        batchSize: BATCH_SIZE,
        params: {
          vibe: v,
          timePeriod: m,
          from: filters.origin,
          destinations: filters.locations,
          duration: filters.duration,
          budget: filters.budget,
          exclusions: filters.exclusions,
          styles: filters.styles,
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

            // Save to history if enabled
            if (shouldSaveToHistory.current) {
              // Get the final destinations state
              setDestinations(prev => {
                saveSearchToHistory(v, m, prev, {
                  origin: filters.origin,
                  destinations: filters.locations,
                  duration: filters.duration,
                  budget: filters.budget,
                  exclusions: filters.exclusions,
                  styles: filters.styles
                })
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

    // Restore filters if present
    if (item.filters) {
      setOrigin(item.filters.origin || "")
      setLocations(item.filters.destinations || [])
      setDuration(item.filters.duration || [3, 14])
      setBudget(item.filters.budget || 2000)
      setExclusions(item.filters.exclusions || [])
      setStyles(item.filters.styles || [])
    } else {
      // Reset filters if not present in history
      setOrigin("")
      setLocations([])
      setDuration([3, 14])
      setBudget(2000)
      setExclusions([])
      setStyles([])
    }

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

  // Auto-detect user location on mount
  useEffect(() => {
    const detectLocation = async () => {
      if (!filters.origin) {
        const location = await getUserLocation()
        if (location) {
          const locationString = formatLocationString(location)
          setOrigin(locationString)
          console.log('[INFO] User location detected:', locationString)
        }
      }
    }

    detectLocation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle keyboard shortcut (Enter) to trigger search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        if (vibe.trim() && !loading) {
          console.log('[INFO] Enter key triggered search')
          handleFindDestinations(vibe, month)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vibe, month, loading])

  // Auto-open search panel when destinations are loaded
  useEffect(() => {
    if (destinations.length > 0) {
      setActivePanel('search')
    }
  }, [destinations])

  // Shared filter logic
  const {
    filters,
    isFilterPanelOpen,
    activeFilterType,
    setOrigin,
    setLocations,
    setDuration,
    setBudget,
    setExclusions,
    setStyles,
    openFilterPanel,
    closeFilterPanel,
    filterCounts
  } = useTripFilters()

  const handleFilterClick = (filterType: string) => {
    openFilterPanel(filterType)
  }

  const handlePanelToggle = (panel: 'none' | 'search' | 'recent' | 'itinerary') => {
    // Calculate next state
    const nextState = activePanel === panel ? 'none' : panel

    // Track event
    if (nextState !== 'none') {
      posthog?.capture('panel_toggled', { panel: nextState, action: 'open' })
    } else {
      posthog?.capture('panel_toggled', { panel: activePanel, action: 'close' })
    }

    // Update state
    setActivePanel(nextState)
  }

  const handleDestinationSelect = (destination: Destination | null) => {
    if (destination) {
      posthog?.capture('destination_selected', {
        region: destination.region,
        country: destination.country,
      })
    }
    setSelectedDestination(destination)
  }

  const handleInspirationChipClick = (chip: InspirationChip) => {
    posthog?.capture('inspiration_chip_clicked', { chip_id: chip.id })

    setVibe(chip.vibes.join(', '))
    setLocations(chip.destinations)
  }

  // Update handleFindDestinations and handleSearchFromHistory to use the new filters object
  // NOTE: We need to update the references inside these functions too.
  // Since replace_file_content works on chunks, let's just do the whole bottom part of the component.

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {/* Map fills entire screen - lowest z-index */}
      <WorldMap
        loading={loading}
        destinations={destinations}
        selectedDestination={selectedDestination}
        onDestinationSelect={setSelectedDestination}
        isSidebarOpen={activePanel !== 'none'}
      />

      {/* User profile button - top right */}
      <div className="fixed top-4 right-4 z-[70]">
        {isSignedIn ? (
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 rounded-full ring-2 ring-violet-300 hover:ring-pink-400 transition-all",
                userButtonPopoverCard: "shadow-xl border border-violet-200",
              }
            }}
          />
        ) : (
          <SignInButton mode="modal">
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-violet-500 hover:from-pink-500 hover:to-violet-600 transition-all shadow-md hover:shadow-lg active:scale-95"
              aria-label="Sign In"
              title="Sign in with Google"
            >
              <svg 
                className="w-5 h-5 text-white" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </button>
          </SignInButton>
        )}
      </div>

      {/* UI elements overlay on top of map */}
      <LeftSidebar
        onRecentClick={() => handlePanelToggle('recent')}
        onSearchClick={() => handlePanelToggle('search')}
        onItineraryClick={() => handlePanelToggle('itinerary')}
      />
      <RecentSearchPanel
        isOpen={activePanel === 'recent'}
        onClose={() => setActivePanel('none')}
        onSearchSelect={handleSearchFromHistory}
      />
      <SearchResultsPanel
        destinations={destinations}
        loading={loading}
        onDestinationClick={handleDestinationSelect}
        selectedDestination={selectedDestination}
        isOpen={activePanel === 'search'}
        onClose={() => setActivePanel('none')}
      />
      <ItineraryPanel
        isOpen={activePanel === 'itinerary'}
        onClose={() => setActivePanel('none')}
        onDestinationClick={handleDestinationSelect}
        selectedDestination={selectedDestination}
      />

      <FilterSidePanel
        isOpen={isFilterPanelOpen}
        onClose={closeFilterPanel}
        activeFilter={activeFilterType}
        origin={filters.origin}
        setOrigin={setOrigin}
        locations={filters.locations}
        setLocations={setLocations}
        duration={filters.duration}
        setDuration={setDuration}
        budget={filters.budget}
        setBudget={setBudget}
        exclusions={filters.exclusions}
        setExclusions={setExclusions}
        styles={filters.styles}
        setStyles={setStyles}
        month={month}
        setMonth={setMonth}
      />

      {/* Search bar and filter tags overlay on top of map */}
      <div className={cn(
        "absolute top-4 flex flex-col gap-2 transition-all duration-300 ease-in-out",
        // Shift right when side panels are open, otherwise stay at left-24
        activePanel !== 'none' ? "left-[540px]" : "left-24",
        // Lower z-index when FilterSidePanel is open so it appears above search bar
        isFilterPanelOpen ? "z-50" : "z-[70]"
      )}>
        <div className="relative">
          <SearchBar
            vibe={vibe}
            setVibe={setVibe}
            onSearch={() => handleFindDestinations(vibe, month)}
          />
          <InspirationChips
            onChipClick={handleInspirationChipClick}
            isVisible={activePanel === 'none' && !isFilterPanelOpen}
          />
        </div>

        {/* Filter Tags - floating individual pills */}
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          activePanel === 'none' && !isFilterPanelOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}>
          <FilterBar
            onFilterClick={handleFilterClick}
            filterCounts={filterCounts}
            month={month}
            setMonth={setMonth}
          />
        </div>
      </div>
    </main>
  )
}
