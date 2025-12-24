'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Sparkles, MapPin, GripVertical, Loader2, ChevronDown, ChevronUp, Sun, Cloud, Moon, Info, Plus, Minus, Calendar, BookOpen, Search, X, Trash2 } from 'lucide-react'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { getSavedLocations, addToSavedLocations, removeFromSavedLocations } from '@/lib/itinerary'
import type { Destination } from '@/lib/generateDestinationInfo'
import { saveItineraryToHistory, type DayBreakdown } from '@/lib/itineraryHistory'
import { useTripFilters } from '@/hooks/useTripFilters'
import { FilterBar } from '@/components/user-input/FilterBar'
import { FilterSidePanel } from '@/components/panels/FilterSidePanel'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { TripDetailsPanel } from '@/components/panels/TripDetailsPanel'

const TripMap = dynamic(() => import('@/components/TripMap'), { ssr: false, loading: () => <div className="w-full h-full bg-violet-50/50 animate-pulse rounded-2xl" /> })

// Drag and Drop imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DropAnimation,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Sortable Item Component
function SortableLocationItem({ 
  location, 
  id, 
  index, 
  onUpdateVibes,
  onRemove
}: { 
  location: Destination
  id: string
  index: number
  onUpdateVibes: (destination: Destination, newVibes: string) => void
  onRemove: (destination: Destination) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const [isEditing, setIsEditing] = useState(false)
  const [newTagInput, setNewTagInput] = useState('')
  const [showRemoveOption, setShowRemoveOption] = useState(false)
  const removeOptionRef = useRef<HTMLDivElement>(null)
  const vibes = location.searchVibe ? location.searchVibe.split(',').map(v => v.trim()).filter(Boolean) : []

  // Close remove option when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (removeOptionRef.current && !removeOptionRef.current.contains(event.target as Node)) {
        setShowRemoveOption(false)
      }
    }

    if (showRemoveOption) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showRemoveOption])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const removeTag = (tagToRemove: string) => {
    const updatedVibes = vibes.filter(v => v !== tagToRemove)
    onUpdateVibes(location, updatedVibes.length > 0 ? updatedVibes.join(', ') : '')
  }

  const addTag = () => {
    if (!newTagInput.trim()) return
    const tag = newTagInput.trim().toLowerCase()
    if (!vibes.includes(tag)) {
      const updatedVibes = [...vibes, tag]
      onUpdateVibes(location, updatedVibes.join(', '))
    }
    setNewTagInput('')
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setNewTagInput('')
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border transition-all hover:shadow-md hover:z-[60]",
        isDragging ? "opacity-50 border-violet-400 z-50 ring-2 ring-violet-400" : "border-violet-100/50 hover:border-violet-300",
      )}
    >
      <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md border-2 border-white z-10">
        {index + 1}
      </div>

      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowRemoveOption(!showRemoveOption)
          }}
          className="cursor-pointer text-violet-300 hover:text-violet-600 p-1 transition-colors"
          aria-label="Options"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        
        {/* Remove option dropdown */}
        {showRemoveOption && (
          <div 
            ref={removeOptionRef}
            className="absolute left-0 top-full mt-1 bg-white border border-violet-200 rounded-lg shadow-lg z-[100] min-w-[120px]"
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(location)
                setShowRemoveOption(false)
              }}
              className="w-full flex items-center justify-center p-2 text-violet-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              aria-label="Remove destination"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 pr-3">
        <h3 className="font-bold text-violet-900 truncate">
          {location.region ? location.region.split(',').slice(0, 3).join(', ') : location.country}
        </h3>
        <div className="flex items-center gap-2 text-xs text-violet-500 truncate">
          <MapPin className="w-3 h-3 shrink-0" />
          {location.country}
        </div>
      </div>

      {/* Editable Vibe Tags - Horizontally scrollable */}
      <div className="shrink-0 flex items-center gap-1.5 min-w-0 max-w-[180px]">
        {(vibes.length > 0 || isEditing) && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide min-w-0 w-full">
            {vibes.map((vibe, i) => (
              <div
                key={i}
                className="shrink-0 px-2 py-1 bg-violet-100 text-violet-700 rounded-lg text-[10px] font-medium border border-violet-200 flex items-center gap-1.5 group/tag"
              >
                <span className="capitalize whitespace-nowrap">{vibe}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeTag(vibe)
                  }}
                  className="opacity-0 group-hover/tag:opacity-100 hover:text-violet-900 transition-opacity shrink-0"
                  aria-label={`Remove ${vibe} tag`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {isEditing ? (
              <div className="shrink-0 flex items-center gap-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => {
                    if (newTagInput.trim()) {
                      addTag()
                    } else {
                      setIsEditing(false)
                    }
                  }}
                  placeholder="Add tag..."
                  className="w-20 px-2 py-1 text-[10px] bg-white border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  autoFocus
                />
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true)
                }}
                className="shrink-0 w-6 h-6 flex items-center justify-center text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg border border-dashed border-violet-300 transition-colors"
                aria-label="Add tag"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
        
        {/* Show Add button when no vibes exist */}
        {vibes.length === 0 && !isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
            className="shrink-0 w-6 h-6 flex items-center justify-center text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg border border-dashed border-violet-300 transition-colors"
            aria-label="Add tag"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function PlanPage() {
  const router = useRouter()
  // We'll use local state for the list order, initialized from saved locations
  const [orderedLocations, setOrderedLocations] = useState<Destination[]>([])
  const [tripDuration, setTripDuration] = useState(7)
  const [generatedPlan, setGeneratedPlan] = useState<DayBreakdown[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]))
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [isConfigOpen, setIsConfigOpen] = useState(true)
  const [month, setMonth] = useState('Anytime')
  const [mobileView, setMobileView] = useState<'config' | 'itinerary'>('config')
  const [cityInput, setCityInput] = useState('')
  const [citySuggestions, setCitySuggestions] = useState<Array<{ name: string; country: string; region?: string; coordinates?: { lat: number; lng: number } }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchingCities, setSearchingCities] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Integrate Filters
  const {
    filters,
    isFilterPanelOpen,
    activeFilterType,
    setOrigin,
    setLocations, // Note: We might want to sync this with orderedLocations? Or keep separate?
    setDuration,
    setBudget,
    setExclusions,
    setStyles,
    openFilterPanel,
    closeFilterPanel,
    filterCounts
  } = useTripFilters()

  // Load locations on mount
  useEffect(() => {
    const locations = getSavedLocations()
    setOrderedLocations(locations)

    // Calculate suggested duration
    if (locations.length > 0) {
      const suggestedDuration = locations.reduce((total, loc) => {
        const recommended = parseInt(loc.recommendedDuration || '3', 10)
        return total + (isNaN(recommended) ? 3 : recommended)
      }, 0)
      setTripDuration(Math.max(7, Math.min(suggestedDuration, 30)))
    }
  }, [])

  // Search for cities with debounce
  useEffect(() => {
    if (!cityInput.trim() || cityInput.length < 2) {
      setCitySuggestions([])
      setShowSuggestions(false)
      setHasSearched(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setSearchingCities(true)
      setHasSearched(false)
      try {
        const suggestions = await searchCities(cityInput)
        setCitySuggestions(suggestions)
        setHasSearched(true)
        setShowSuggestions(true)
      } catch (error) {
        console.error('Error searching cities:', error)
        setCitySuggestions([])
        setHasSearched(true)
        setShowSuggestions(true)
      } finally {
        setSearchingCities(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [cityInput])

  const searchCities = async (query: string): Promise<Array<{ name: string; country: string; region?: string; coordinates?: { lat: number; lng: number } }>> => {
    if (!query.trim() || query.length < 2) {
      return []
    }

    try {
      const response = await fetch(`/api/city-search?q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        console.error('City search API error:', response.status)
        return []
      }

      const data = await response.json()

      if (data.error) {
        console.warn('City search API error:', data.error)
        return []
      }

      return data.suggestions || []
    } catch (error) {
      console.error('Error fetching cities from LocationIQ:', error)
      return []
    }
  }

  const handleCitySelect = (suggestion: { name: string; country: string; region?: string; coordinates?: { lat: number; lng: number } }) => {
    // Clear any pending blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }
    
    const destination: Destination = {
      country: suggestion.country,
      region: suggestion.region || suggestion.name,
      coordinates: suggestion.coordinates,
      recommendedDuration: '3',
      searchVibe: 'holiday' // Default tag
    }
    
    addToSavedLocations(destination)
    // Reload from saved locations to ensure consistency
    const updatedLocations = getSavedLocations()
    setOrderedLocations(updatedLocations)
    setCityInput('')
    setShowSuggestions(false)
    setCitySuggestions([])
    setHasSearched(false)
  }

  const handleManualCityAdd = () => {
    if (!cityInput.trim()) return
    
    // Parse city input - assume format: "City, Country" or just "City"
    const parts = cityInput.split(',').map(s => s.trim())
    const cityName = parts[0]
    const country = parts[1] || cityName // If no country, use city name as fallback
    
    const destination: Destination = {
      country: country,
      region: cityName,
      recommendedDuration: '3',
      searchVibe: 'holiday' // Default tag
    }
    
    addToSavedLocations(destination)
    // Reload from saved locations to ensure consistency
    const updatedLocations = getSavedLocations()
    setOrderedLocations(updatedLocations)
    setCityInput('')
    setShowSuggestions(false)
  }

  const updateDestinationVibes = (destination: Destination, newVibes: string) => {
    const updatedDestination = { ...destination, searchVibe: newVibes || undefined }
    
    // Update in saved locations
    const locations = getSavedLocations()
    const index = locations.findIndex(
      loc => loc.region === destination.region && loc.country === destination.country
    )
    
    if (index !== -1) {
      locations[index] = updatedDestination
      // Save back to localStorage using the same method as the library
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('vibegetaway-saved-locations', JSON.stringify(locations))
          window.dispatchEvent(new CustomEvent('locationsUpdated'))
        } catch (error) {
          console.error('Error updating destination:', error)
        }
      }
    }
    
    // Update in ordered locations state
    setOrderedLocations(prev => 
      prev.map(loc => 
        loc.region === destination.region && loc.country === destination.country
          ? updatedDestination
          : loc
      )
    )
  }

  const handleRemoveDestination = (destination: Destination) => {
    // Remove from saved locations
    removeFromSavedLocations(destination)
    
    // Update ordered locations state
    setOrderedLocations(prev => 
      prev.filter(loc => 
        !(loc.region === destination.region && loc.country === destination.country)
      )
    )
  }

  // Drag and Drop Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      setOrderedLocations((items) => {
        // We are using the location name/region as ID for simplicity, assuming uniqueness for now
        // A better approach would be proper IDs. 
        // Let's assume verifying index finding works:
        const oldIndex = items.findIndex(i => (i.region || i.country) === active.id)
        const newIndex = items.findIndex(i => (i.region || i.country) === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  }

  const handlePlanTrip = async () => {
    setLoading(true)
    setError(null)
    setGeneratedPlan([]) // Clear previous plan

    try {
      const response = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locations: orderedLocations.map(loc => ({
            region: loc.region,
            country: loc.country,
            recommendedDuration: loc.recommendedDuration,
            searchVibe: loc.searchVibe,
          })),
          tripDuration,
          // Pass filters to the API
          filters: {
            origin: filters.origin,
            budget: filters.budget,
            exclusions: filters.exclusions,
            styles: filters.styles,
            // We ignore duration filter here as we have explicit tripDuration
            // We ignore locations filter here as we have explicit orderedLocations
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate itinerary')
      }

      const data = await response.json()
      setGeneratedPlan(data.plan)
      setExpandedDays(new Set([1]))
      setSelectedDay(1) // Auto-select day 1
      setIsConfigOpen(false)
      setMobileView('itinerary') // Switch to itinerary view on mobile after generation

      // We don't auto-save immediately here, letting user view it first? 
      // Or keep existing behavior. Existing behavior saved it.
      // Let's keep existing behavior for now but maybe just show it first.

      // Existing logic to generate name and save:
      /* 
      // ... (Same logic as before for saving)
      */

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Helper toggle functions
  const toggleDay = (day: number) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev)
      if (newSet.has(day)) newSet.delete(day)
      else newSet.add(day)
      return newSet
    })
  }
  const expandAll = () => setExpandedDays(new Set(generatedPlan.map(d => d.day)))
  const collapseAll = () => setExpandedDays(new Set())


  const { isSignedIn } = useUser()

  // Calculate selected day logic for Map and Details Panel
  const selectedDayData = selectedDay
    ? generatedPlan.find(d => d.day === selectedDay) || null
    : null

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-violet-100 via-pink-100 to-rose-100 flex flex-col relative">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-violet-200/50 z-20 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">
          {/* Home button - left */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center p-2 rounded-full bg-violet-50 text-violet-700 hover:bg-violet-100 hover:text-violet-900 transition-all"
            aria-label="Home"
          >
            <Home className="w-5 h-5" />
          </button>
          
          {/* Title - centered */}
          <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">
            Itinerary Planner
          </h1>
          
          {/* Spacer - right (same width as home button for balance) */}
          <div className="w-10 h-10" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden max-w-[1400px] mx-auto w-full px-2 py-2 gap-2">
        {/* Left Column - Configuration & Itinerary */}
        <div className="w-full md:w-[40%] flex flex-col gap-2 overflow-y-auto pr-1 no-scrollbar">

          {/* Configuration Card (Collapsable) - Show on desktop always, on mobile only when mobileView === 'config' */}
          <div className={cn(
            "bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg p-4 transition-all duration-300",
            "md:block",
            mobileView === 'config' ? "block" : "hidden"
          )}>
            {/* Header with Toggle */}
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsConfigOpen(!isConfigOpen)}
            >
              <div>
                <h2 className="text-xl font-bold text-violet-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-violet-500" />
                  Trip Configuration
                </h2>
                {!isConfigOpen && <p className="text-sm text-violet-500 mt-1">Review your settings</p>}
              </div>

              <div className="flex items-center gap-4">
                {!isConfigOpen && (
                  <div className="text-sm font-semibold text-violet-600 bg-violet-100 px-3 py-1 rounded-lg">
                    {tripDuration} Days
                  </div>
                )}
                {isConfigOpen ? <ChevronUp className="w-5 h-5 text-violet-400" /> : <ChevronDown className="w-5 h-5 text-violet-400" />}
              </div>
            </div>

            {/* Collapsable Content */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isConfigOpen ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>

              {/* Draggable List */}
              <div className="space-y-4">
                {orderedLocations.length === 0 ? (
                  <div className="py-6 px-4 bg-violet-50/50 rounded-xl border border-violet-200/50">
                    <div className="text-center mb-4">
                      <MapPin className="w-8 h-8 text-violet-300 mx-auto mb-2" />
                      <p className="text-sm text-violet-600 font-medium mb-1">No destinations added yet</p>
                      <p className="text-xs text-violet-500 mb-4">Add a destination to start planning your trip</p>
                    </div>
                    
                    {/* City Input with Autocomplete */}
                    <div className="relative">
                      <div className="relative flex items-center">
                        <Search className="absolute left-3 w-4 h-4 text-violet-400" />
                        <input
                          type="text"
                          value={cityInput}
                          onChange={(e) => setCityInput(e.target.value)}
                          onFocus={() => cityInput.length >= 2 && setShowSuggestions(true)}
                          placeholder="Search for a city (e.g., Paris, Tokyo)"
                          className="w-full pl-10 pr-10 py-2.5 bg-white border border-violet-200 rounded-lg text-sm text-violet-900 placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                        {cityInput && (
                          <button
                            onClick={() => {
                              setCityInput('')
                              setShowSuggestions(false)
                              setCitySuggestions([])
                              setHasSearched(false)
                            }}
                            className="absolute right-3 p-1 text-violet-400 hover:text-violet-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      {/* Suggestions Dropdown */}
                      {showSuggestions && cityInput.length >= 2 && (
                        <div 
                          className="absolute z-50 w-full mt-1 bg-white border border-violet-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          {searchingCities ? (
                            <div className="p-3 text-center text-sm text-violet-500">
                              <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
                              Searching...
                            </div>
                          ) : hasSearched && citySuggestions.length === 0 ? (
                            <div className="p-3 text-center text-sm text-violet-500">
                              No results found for "{cityInput}"
                            </div>
                          ) : citySuggestions.length > 0 ? (
                            citySuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleCitySelect(suggestion)}
                                className="w-full text-left px-4 py-2.5 hover:bg-violet-50 transition-colors border-b border-violet-100 last:border-b-0"
                              >
                                <div className="font-medium text-violet-900">{suggestion.name}</div>
                                <div className="text-xs text-violet-500">
                                  {suggestion.regionName ? `${suggestion.regionName}, ${suggestion.country}` : suggestion.country}
                                </div>
                              </button>
                            ))
                          ) : null}
                        </div>
                      )}
                      
                    </div>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={orderedLocations.map(l => l.region || l.country)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2 pl-6">
                        {orderedLocations.map((location, index) => (
                          <SortableLocationItem
                            key={location.region || location.country}
                            id={location.region || location.country}
                            location={location}
                            index={index}
                            onUpdateVibes={updateDestinationVibes}
                            onRemove={handleRemoveDestination}
                          />
                        ))}
                      </div>
                    </SortableContext>

                    {/* Add Destination Input - shown when locations exist */}
                    <div className="mt-4 pt-4 border-t border-violet-100">
                      <div className="relative">
                        <div className="relative flex items-center">
                          <Search className="absolute left-3 w-4 h-4 text-violet-400" />
                          <input
                            type="text"
                            value={cityInput}
                            onChange={(e) => setCityInput(e.target.value)}
                            onFocus={() => {
                              if (cityInput.length >= 2) {
                                setShowSuggestions(true)
                              }
                            }}
                            onBlur={() => {
                              // Delay hiding to allow clicks on suggestions
                              blurTimeoutRef.current = setTimeout(() => {
                                setShowSuggestions(false)
                              }, 200)
                            }}
                            onFocus={() => {
                              // Clear any pending blur timeout
                              if (blurTimeoutRef.current) {
                                clearTimeout(blurTimeoutRef.current)
                                blurTimeoutRef.current = null
                              }
                              if (cityInput.length >= 2) {
                                setShowSuggestions(true)
                              }
                            }}
                            placeholder="Add another city..."
                            className="w-full pl-10 pr-10 py-2 bg-white border border-violet-200 rounded-lg text-sm text-violet-900 placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          />
                          {cityInput && (
                            <button
                              onClick={() => {
                                setCityInput('')
                                setShowSuggestions(false)
                                setCitySuggestions([])
                                setHasSearched(false)
                              }}
                              className="absolute right-3 p-1 text-violet-400 hover:text-violet-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        {/* Suggestions Dropdown */}
                        {showSuggestions && cityInput.length >= 2 && (
                          <div 
                            className="absolute z-50 w-full mt-1 bg-white border border-violet-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            {searchingCities ? (
                              <div className="p-3 text-center text-sm text-violet-500">
                                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
                                Searching...
                              </div>
                            ) : hasSearched && citySuggestions.length === 0 ? (
                              <div className="p-3 text-center text-sm text-violet-500">
                                No results found for "{cityInput}"
                              </div>
                            ) : citySuggestions.length > 0 ? (
                              citySuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleCitySelect(suggestion)}
                                  className="w-full text-left px-4 py-2.5 hover:bg-violet-50 transition-colors border-b border-violet-100 last:border-b-0"
                                >
                                  <div className="font-medium text-violet-900">{suggestion.name}</div>
                                  <div className="text-xs text-violet-500">
                                    {suggestion.regionName ? `${suggestion.regionName}, ${suggestion.country}` : suggestion.country}
                                  </div>
                                </button>
                              ))
                            ) : null}
                          </div>
                        )}
                        
                      </div>
                    </div>

                    <DragOverlay
                      dropAnimation={dropAnimation}
                      adjustScale={false}
                      modifiers={[snapCenterToCursor]}
                      style={{ cursor: 'grabbing' }}
                    >
                      {activeId ? (() => {
                        const draggedLocation = orderedLocations.find(l => (l.region || l.country) === activeId)!
                        const draggedIndex = orderedLocations.findIndex(l => (l.region || l.country) === activeId)
                        return (
                          <div className="group relative flex items-center gap-4 p-4 bg-white backdrop-blur-sm rounded-xl border border-violet-400 shadow-2xl ring-2 ring-violet-400 opacity-95">
                            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md border-2 border-white z-10">
                              {draggedIndex + 1}
                            </div>
                            <div className="cursor-grabbing text-violet-600 p-1 pointer-events-none">
                              <GripVertical className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0 pr-2">
                              <h3 className="font-bold text-violet-900 truncate pr-2">
                                {draggedLocation.region || draggedLocation.country}
                              </h3>
                              <div className="flex items-center gap-2 text-xs text-violet-500 truncate mb-1.5">
                                <MapPin className="w-3 h-3" />
                                {draggedLocation.country}
                              </div>
                              {/* Vibe Tags - Drag View (Simplified) */}
                              {draggedLocation.searchVibe && (
                                <div className="shrink-0">
                                  <div className="px-2 py-1 bg-violet-100 text-violet-700 rounded-lg text-[10px] font-medium border border-violet-200 flex items-center gap-1">
                                    <span className="max-w-[60px] truncate block">
                                      {draggedLocation.searchVibe.split(',')[0].trim()}
                                    </span>
                                    {draggedLocation.searchVibe.split(',').length > 1 && (
                                      <span className="opacity-70">
                                        +{draggedLocation.searchVibe.split(',').length - 1}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })() : null}
                    </DragOverlay>
                  </DndContext>
                )}
              </div>

              {/* Integrated Filters Section */}
              <div className="space-y-4 pt-4 border-t border-violet-100 mt-6">
                <div className="flex items-center justify-between text-sm text-violet-600 font-medium mb-3">
                  <span className="font-semibold">Preferences & Constraints</span>
                </div>
                <div className="bg-violet-50/50 rounded-xl p-4 border border-violet-100 space-y-4">
                  {/* Duration Display/Input */}
                  <div className="flex justify-center">
                    <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 p-2 rounded-lg">
                      <div className="text-violet-700 font-medium text-xs uppercase tracking-wide px-2">
                        Duration
                      </div>
                      <div className="flex items-center gap-1 bg-white border border-violet-200 rounded-lg">
                        <button
                          onClick={() => setTripDuration(Math.max(1, tripDuration - 1))}
                          disabled={tripDuration <= 1}
                          className="p-1.5 text-violet-600 hover:bg-violet-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Decrease duration"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={tripDuration}
                          onChange={(e) => setTripDuration(Math.max(1, Math.min(30, parseInt(e.target.value, 10) || 7)))}
                          className="w-16 bg-transparent text-violet-900 font-bold text-xl text-center focus:outline-none placeholder-violet-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => setTripDuration(Math.min(30, tripDuration + 1))}
                          disabled={tripDuration >= 30}
                          className="p-1.5 text-violet-600 hover:bg-violet-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Increase duration"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-violet-700 font-semibold pr-2 text-sm">Days</span>
                    </div>
                  </div>

                  {/* Filter Bar - Now visible with all props */}
                  <div className="pt-4">
                    <div className="flex justify-center items-center">
                      <FilterBar
                        onFilterClick={(type) => openFilterPanel(type)}
                        filterCounts={filterCounts}
                        month={month}
                        setMonth={setMonth}
                        origin={filters.origin}
                        setOrigin={setOrigin}
                        locations={filters.locations}
                        setLocations={setLocations}
                        exclusions={filters.exclusions}
                        setExclusions={setExclusions}
                        className="flex flex-wrap gap-3 justify-center items-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handlePlanTrip}
                disabled={loading || orderedLocations.length === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 mt-6 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold rounded-xl hover:from-violet-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Itinerary...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Itinerary
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-200">
                  {error}
                </div>
              )}
            </div>

            {/* Mobile-only button to view itinerary if one exists */}
            {generatedPlan.length > 0 && (
              <div className="md:hidden mt-4">
                <button
                  onClick={() => setMobileView('itinerary')}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold rounded-xl hover:from-violet-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <Sparkles className="w-5 h-5" />
                  View Itinerary
                </button>
              </div>
            )}
          </div>

          {/* Generated Itinerary Result - Show on desktop always, on mobile only when mobileView === 'itinerary' */}
          {generatedPlan.length > 0 && (
            <div className={cn(
              "space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20",
              "md:block",
              mobileView === 'itinerary' ? "block" : "hidden"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-violet-900">Your Daily Plan</h2>
                  {/* Mobile-only button to go back to config */}
                  <button
                    onClick={() => setMobileView('config')}
                    className="md:hidden flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-violet-600 hover:bg-violet-100 rounded-lg transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                    <span>Config</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={expandAll} className="text-xs font-semibold text-violet-600 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors">Expand All</button>
                  <button onClick={collapseAll} className="text-xs font-semibold text-violet-600 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors">Collapse All</button>
                </div>
              </div>

              {generatedPlan.map((day) => {
                const isExpanded = expandedDays.has(day.day)
                const isSelected = selectedDay === day.day

                return (
                  <div
                    key={day.day}
                    className={cn(
                      "bg-white/80 backdrop-blur-sm border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all",
                      isSelected ? "border-violet-500 ring-2 ring-violet-200" : "border-violet-100"
                    )}
                  >
                    <button
                      onClick={() => {
                        setSelectedDay(day.day) // Click body to select
                      }}
                      className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-violet-50/50 to-pink-50/50 hover:from-violet-100/50 hover:to-pink-100/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "w-12 h-12 flex items-center justify-center font-bold rounded-xl shadow-lg text-lg border-2 border-white transition-all",
                          isSelected ? "bg-violet-600 text-white scale-110" : "bg-gradient-to-br from-violet-500 to-pink-500 text-white"
                        )}>
                          {day.day}
                        </span>
                        <div className="text-left flex-1">
                          <p className="font-bold text-violet-900">{day.location}</p>
                          <p className="text-xs text-violet-500 font-medium">Click to view map & details</p>
                        </div>
                      </div>

                      {/* Independent Expand Button */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleDay(day.day)
                        }}
                        className="p-2 hover:bg-violet-100 rounded-full text-violet-400 hover:text-violet-600 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 space-y-4 border-t border-violet-100">
                        {/* Morning */}
                        <div className="flex gap-3">
                          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg h-fit"><Sun className="w-4 h-4" /></div>
                          <div>
                            <h4 className="text-sm font-bold text-violet-900">{day.morning.activity}</h4>
                            <p className="text-sm text-violet-600 mt-1">{day.morning.description}</p>
                          </div>
                        </div>
                        {/* Midday */}
                        <div className="flex gap-3">
                          <div className="p-2 bg-sky-100 text-sky-600 rounded-lg h-fit"><Cloud className="w-4 h-4" /></div>
                          <div>
                            <h4 className="text-sm font-bold text-violet-900">{day.midday.activity}</h4>
                            <p className="text-sm text-violet-600 mt-1">{day.midday.description}</p>
                          </div>
                        </div>
                        {/* Evening */}
                        <div className="flex gap-3">
                          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg h-fit"><Moon className="w-4 h-4" /></div>
                          <div>
                            <h4 className="text-sm font-bold text-violet-900">{day.evening.activity}</h4>
                            <p className="text-sm text-violet-600 mt-1">{day.evening.description}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

        </div>

        {/* Right Column - Map & Details - Always shown on desktop, hidden on mobile when showing itinerary */}
        <div className={cn(
          "w-[60%] flex-col gap-2 h-full",
          mobileView === 'itinerary' ? "hidden" : "hidden md:flex"
        )}>
          {/* Top: Map Component (35% height) */}
          <div className="h-[35%] min-h-[250px] relative rounded-2xl overflow-hidden shadow-lg border border-violet-100 bg-violet-50">
            <TripMap locations={orderedLocations} selectedDay={selectedDayData} className="h-full w-full" />
          </div>

          {/* Bottom: Trip Details (Remaining height) */}
          <div className="flex-1 overflow-hidden rounded-2xl shadow-lg border border-violet-100 bg-white/40 backdrop-blur-sm">
            <TripDetailsPanel selectedDayData={selectedDayData} className="h-full" />
          </div>
        </div>
      </div>

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

      {/* User profile button - bottom left */}
      <div className="fixed bottom-4 left-4 z-[70]">
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
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </button>
          </SignInButton>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full h-16 bg-white border-t border-violet-200/50 flex flex-row justify-around items-center z-[60] md:hidden px-2 pb-safe">
        {/* Trip button - shows current configurations */}
        <button
          type="button"
          className={cn(
            "relative flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200",
            orderedLocations.length > 0
              ? "bg-violet-50 text-violet-600 border border-violet-200"
              : "text-violet-600 hover:bg-violet-50/50 border border-transparent hover:border-violet-200"
          )}
          aria-label="Trip Configuration"
        >
          <div className="relative">
            <Calendar className="w-6 h-6" strokeWidth={2} />
            {orderedLocations.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {orderedLocations.length > 9 ? '9+' : orderedLocations.length}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">Trip</span>
        </button>

        {/* Past Itineraries button */}
        <button
          type="button"
          className="flex flex-col items-center justify-center p-2 text-gray-500 hover:text-pink-500"
          aria-label="Past Itineraries"
        >
          <BookOpen className="w-6 h-6" strokeWidth={2} />
          <span className="text-[10px] mt-1">Itineraries</span>
        </button>
      </div>
    </div>
  )
}

