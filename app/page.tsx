'use client'

import { SearchBar } from '@/components/user-input/SearchBar'
import { InspirationChips } from '@/components/user-input/InspirationChips'
import { LeftSidebar } from '@/components/LeftSidebar'
import { MobileBottomNav } from '@/components/MobileBottomNav'
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
import { usePostHog } from 'posthog-js/react'
import type { InspirationChip } from '@/data/inspirationChips'
import { getUserLocation, formatLocationString } from '@/lib/geolocation'
import { useTripFilters } from '@/hooks/useTripFilters'
import { getSavedLocationsCount } from '@/lib/itinerary'
import { useRouter } from 'next/navigation'
import { Calendar } from 'lucide-react'
import Image from 'next/image'

// Dynamic import to avoid SSR issues with Leaflet
const WorldMap = dynamic(() => import('@/components/map/WorldMap'), { ssr: false })

// Number of destinations to fetch in parallel per batch
const BATCH_SIZE = 5

export default function Home() {
  const posthog = usePostHog()
  const router = useRouter()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(false)
  const [vibe, setVibe] = useState('')
  const [month, setMonth] = useState('Anytime')
  const [activePanel, setActivePanel] = useState<'none' | 'search' | 'recent' | 'itinerary'>('none')
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)
  const [savedCount, setSavedCount] = useState(0)

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

            // Attach search vibe to destinations
            const destinationsWithVibe = destinations.map(d => ({
              ...d,
              searchVibe: v
            }))

            setDestinations(destinationsWithVibe)
            setLoading(false)
          },
          onBatchComplete: (updatedDestinations) => {
            // Ignore if a newer call started
            if (callId !== callIdRef.current) {
              return
            }

            // Attach search vibe to updated destinations
            // Note: updatedDestinations come from fetchDestinationsWithDetails which merges
            // details into the existing objects. We need to ensure the vibe persists or is re-applied.
            // Since fetchDestinationsWithDetails returns enriched objects based on input, 
            // and we pass destinations (which will have vibe if we do onInitialDestinations correctly),
            // we might already have it. But let's be safe.
            const destinationsWithVibe = updatedDestinations.map(d => ({
              ...d,
              searchVibe: v
            }))

            setDestinations(destinationsWithVibe)
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

  // Track saved locations count
  useEffect(() => {
    setSavedCount(getSavedLocationsCount())

    const handleLocationsUpdate = () => {
      setSavedCount(getSavedLocationsCount())
    }

    window.addEventListener('locationsUpdated', handleLocationsUpdate)

    return () => {
      window.removeEventListener('locationsUpdated', handleLocationsUpdate)
    }
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

  // Listen for custom event to open Recent panel from UserButton
  useEffect(() => {
    const handleOpenRecent = () => handlePanelToggle('recent')
    window.addEventListener('openRecentPanel', handleOpenRecent)
    return () => window.removeEventListener('openRecentPanel', handleOpenRecent)
  }, [activePanel])

  // Auto-open search panel when destinations are loaded
  useEffect(() => {
    if (destinations.length > 0) {
      setActivePanel('search')
    }
  }, [destinations])

  // If we end up with no results, ensure the search panel isn't "open" (avoids blank sidebar/layout shift).
  useEffect(() => {
    if (activePanel === 'search' && !loading && destinations.length === 0) {
      setActivePanel('none')
    }
  }, [activePanel, loading, destinations.length])

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
    if (filterType === 'all-filters') {
      openFilterPanel()
    }
  }

  const handlePanelToggle = (panel: 'none' | 'search' | 'recent' | 'itinerary') => {
    const canShowSearchPanel = loading || destinations.length > 0

    // Don't open the search results panel when there's nothing to show.
    // Allow closing if it's already the active panel.
    if (panel === 'search' && !canShowSearchPanel && activePanel !== 'search') {
      return
    }

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
        isSidebarOpen={activePanel !== 'none' && !(activePanel === 'search' && !loading && destinations.length === 0)}
      />

      {/* Itinerary Planner Button - top right, aligned with search bar */}
      <div className={cn(
        "hidden md:flex absolute items-center transition-all duration-300 ease-in-out z-[70] right-4",
        // Align with search bar visual center
        // Search bar container: top-4 (16px)
        // Search bar has p-2.5 (10px top padding) and content height ~38px
        // Center = 16px + 10px + 19px = 45px, but we want to align button center
        "top-[calc(1rem+0.625rem+19px)]"
      )}>
        <button
          onClick={() => router.push('/plan')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm -translate-y-1/2",
            savedCount > 0
              ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:from-violet-700 hover:to-pink-700 shadow-md hover:shadow-lg"
              : "bg-white/90 backdrop-blur-md border border-violet-200 text-violet-600 hover:bg-violet-50 hover:border-violet-300"
          )}
        >
          <Calendar className="w-4 h-4" />
          <span>Plan Trip</span>
          {savedCount > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full">
              {savedCount > 9 ? '9+' : savedCount}
            </span>
          )}
        </button>
      </div>

      {/* UI elements overlay on top of map */}
      <LeftSidebar
        onSearchClick={() => handlePanelToggle('search')}
        onItineraryClick={() => handlePanelToggle('itinerary')}
      />
      <MobileBottomNav
        onSearchClick={() => handlePanelToggle('search')}
        onItinerariesClick={() => handlePanelToggle('itinerary')}
        activeItem={activePanel === 'itinerary' ? 'itineraries' : 'search'}
        tripInactiveTone="gray"
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
        isOpen={activePanel === 'search' && (loading || destinations.length > 0)}
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
        "absolute flex flex-col gap-2 transition-all duration-300 ease-in-out",
        // Mobile: fixed top, full width, smaller margins
        "fixed md:absolute top-0 md:top-4 left-0 w-full md:w-auto px-2 pt-4 md:px-0 md:pt-0 items-center md:items-start",
        // Desktop positioning
        (activePanel !== 'none' && !(activePanel === 'search' && !loading && destinations.length === 0)) ? "md:left-[540px]" : "md:left-24",
        // Lower z-index when FilterSidePanel is open so it appears above search bar
        isFilterPanelOpen ? "z-50" : "z-[70]"
      )}>
        <div className="relative flex flex-row items-center gap-2 w-full max-w-full">
          <SearchBar
            vibe={vibe}
            setVibe={setVibe}
            onSearch={() => handleFindDestinations(vibe, month)}
            onSettingsClick={openFilterPanel}
          />
          {/* Desktop InspirationChips - positioned next to search bar */}
          <div className="hidden md:block">
            <InspirationChips
              onChipClick={handleInspirationChipClick}
              isVisible={activePanel === 'none' && !isFilterPanelOpen}
            />
          </div>
        </div>

        {/* Mobile InspirationChips and Filter Tags - below search bar */}
        <div className={cn(
          "transition-all duration-300 ease-in-out w-full",
          activePanel === 'none' && !isFilterPanelOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}>
          {/* Mobile InspirationChips */}
          <div className="md:hidden w-full overflow-visible">
            <InspirationChips
              onChipClick={handleInspirationChipClick}
              isVisible={activePanel === 'none' && !isFilterPanelOpen}
            />
          </div>
          {/* Filter Tags - floating individual pills (desktop only) */}
          <FilterBar
            onFilterClick={handleFilterClick}
            filterCounts={filterCounts}
            month={month}
            setMonth={setMonth}
            origin={filters.origin}
            setOrigin={setOrigin}
            locations={filters.locations}
            setLocations={setLocations}
            exclusions={filters.exclusions}
            setExclusions={setExclusions}
          />
        </div>
      </div>
    </main>
  )
}
