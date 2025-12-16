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

// Dynamic import to avoid SSR issues with Leaflet
const WorldMap = dynamic(() => import('@/components/map/WorldMap'), { ssr: false })

const isDev = process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev-local'

// Number of destinations to fetch in parallel per batch
const BATCH_SIZE = 5

export default function Home() {
  const posthog = usePostHog()
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
        origin: filterOrigin,
        destinations: filterLocations,
        duration: filterDuration,
        budget: filterBudget,
        exclusions: filterExclusions,
        styles: filterStyles,
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
          from: filterOrigin,
          destinations: filterLocations,
          duration: filterDuration,
          budget: filterBudget,
          exclusions: filterExclusions,
          styles: filterStyles,
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
                  origin: filterOrigin,
                  destinations: filterLocations,
                  duration: filterDuration,
                  budget: filterBudget,
                  exclusions: filterExclusions,
                  styles: filterStyles
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
      setFilterOrigin(item.filters.origin || "")
      setFilterLocations(item.filters.destinations || [])
      setFilterDuration(item.filters.duration || [3, 14])
      setFilterBudget(item.filters.budget || 2000)
      setFilterExclusions(item.filters.exclusions || [])
      setFilterStyles(item.filters.styles || [])
    } else {
      // Reset filters if not present in history
      setFilterOrigin("")
      setFilterLocations([])
      setFilterDuration([3, 14])
      setFilterBudget(2000)
      setFilterExclusions([])
      setFilterStyles([])
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
      if (!filterOrigin) {
        const location = await getUserLocation()
        if (location) {
          const locationString = formatLocationString(location)
          setFilterOrigin(locationString)
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

  // Filter state
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [activeFilterType, setActiveFilterType] = useState<string | undefined>(undefined)

  // Filter values state (lifted from FilterSidePanel)
  const [filterOrigin, setFilterOrigin] = useState("")
  const [filterLocations, setFilterLocations] = useState<string[]>([])
  const [filterDuration, setFilterDuration] = useState<[number, number]>([3, 14])
  const [filterBudget, setFilterBudget] = useState<number>(2000)
  const [filterExclusions, setFilterExclusions] = useState<string[]>([])
  const [filterStyles, setFilterStyles] = useState<string[]>([])

  const handleFilterClick = (filterType: string) => {
    posthog?.capture('filter_panel_opened', { filter_type: filterType })
    setActiveFilterType(filterType)
    setIsFilterPanelOpen(true)
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
    setFilterLocations(chip.destinations)
    
    setTimeout(() => {
      handleFindDestinations(chip.vibes.join(', '), month)
    }, 100)
  }

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
        currentVibe={vibe}
      />

      <FilterSidePanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        activeFilter={activeFilterType}
        origin={filterOrigin}
        setOrigin={setFilterOrigin}
        locations={filterLocations}
        setLocations={setFilterLocations}
        duration={filterDuration}
        setDuration={setFilterDuration}
        budget={filterBudget}
        setBudget={setFilterBudget}
        exclusions={filterExclusions}
        setExclusions={setFilterExclusions}
        styles={filterStyles}
        setStyles={setFilterStyles}
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
            month={month}
            setMonth={setMonth}
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
          isFilterPanelOpen
            ? "opacity-0 -translate-y-2 pointer-events-none"
            : "opacity-100 translate-y-0"
        )}>
          <FilterBar
            onFilterClick={handleFilterClick}
            filterCounts={{
              origin: filterOrigin ? 1 : 0,
              destination: filterLocations.length,
              exclusions: filterExclusions.length,
              budget: filterBudget !== 2000 ? 1 : 0,
              all: (filterOrigin ? 1 : 0) +
                filterLocations.length +
                filterExclusions.length +
                (filterBudget !== 2000 ? 1 : 0)
            }}
          />
        </div>
      </div>
    </main>
  )
}
