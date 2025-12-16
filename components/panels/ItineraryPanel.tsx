'use client'

import { useState, useEffect } from 'react'
import { Destination } from '@/lib/generateDestinationInfo'
import { getCountryName } from '@/lib/countryCodeMapping'
import { MapPin, X, Trash2, Route, Calendar, ChevronDown, ChevronUp, Sun, CloudSun, Moon, Plane, Sparkles, Plus } from 'lucide-react'
import {
  type Itinerary,
  type GeneratedDay,
  getAllItineraries,
  getActiveItinerary,
  setActiveItineraryId,
  removeDestinationFromItinerary,
  deleteItinerary,
  createItinerary,
  formatAddedDate,
} from '@/lib/itinerary'
import { TripPlannerModal } from './TripPlannerModal'
import { ItinerarySelector, CreateItineraryDialog } from '../itinerary'

interface ItineraryPanelProps {
  isOpen: boolean
  onClose: () => void
  onDestinationClick: (destination: Destination) => void
  selectedDestination: Destination | null
  currentVibe?: string
}

export function ItineraryPanel({
  isOpen,
  onClose,
  onDestinationClick,
  selectedDestination,
  currentVibe = '',
}: ItineraryPanelProps) {
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [activeItinerary, setActiveItinerary] = useState<Itinerary | null>(null)
  const [isTripPlannerOpen, setIsTripPlannerOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set())

  const refreshItineraries = () => {
    const all = getAllItineraries()
    setItineraries(all)
    setActiveItinerary(getActiveItinerary())
  }

  useEffect(() => {
    refreshItineraries()

    const handleItineraryUpdate = () => {
      refreshItineraries()
    }

    window.addEventListener('itineraryUpdated', handleItineraryUpdate)
    return () => window.removeEventListener('itineraryUpdated', handleItineraryUpdate)
  }, [])

  const handleSelectItinerary = (itinerary: Itinerary) => {
    setActiveItineraryId(itinerary.id)
    setActiveItinerary(itinerary)
    setExpandedDays(new Set())
  }

  const handleCreateItinerary = (name: string, vibe: string) => {
    const newItinerary = createItinerary(name, vibe)
    refreshItineraries()
  }

  const handleRemoveDestination = (destination: Destination, e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeItinerary) {
      removeDestinationFromItinerary(activeItinerary.id, destination)
      refreshItineraries()
    }
  }

  const handleDeleteItinerary = () => {
    if (activeItinerary && window.confirm(`Delete "${activeItinerary.name}"? This cannot be undone.`)) {
      deleteItinerary(activeItinerary.id)
      refreshItineraries()
    }
  }

  const toggleDay = (dayNumber: number) => {
    const newExpanded = new Set(expandedDays)
    if (newExpanded.has(dayNumber)) {
      newExpanded.delete(dayNumber)
    } else {
      newExpanded.add(dayNumber)
    }
    setExpandedDays(newExpanded)
  }

  const destinations = activeItinerary?.destinations || []
  const generatedPlan = activeItinerary?.generatedPlan || null

  const uniqueLocations = generatedPlan
    ? Array.from(new Set(generatedPlan.map(d => d.location)))
    : []

  const locationColors = [
    'bg-pink-100 text-pink-800',
    'bg-violet-100 text-violet-800',
    'bg-blue-100 text-blue-800',
    'bg-emerald-100 text-emerald-800',
    'bg-amber-100 text-amber-800',
    'bg-rose-100 text-rose-800',
  ]

  const getLocationColor = (location: string) => {
    const index = uniqueLocations.indexOf(location) % locationColors.length
    return locationColors[index]
  }

  return (
    <div
      className={`fixed left-16 top-0 h-screen w-full max-w-md bg-white/95 backdrop-blur-md border-r border-violet-200 shadow-2xl z-40 transition-transform duration-300 ease-in-out overflow-y-auto pointer-events-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-violet-900 mb-1 tracking-tight">Itineraries</h2>
            <p className="text-violet-500 text-xs font-medium">
              {itineraries.length === 0
                ? 'Create your first itinerary'
                : `${itineraries.length} itinerary${itineraries.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-violet-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-violet-500" />
          </button>
        </div>

        {/* Itinerary Selector */}
        <div className="mb-6">
          <ItinerarySelector
            itineraries={itineraries}
            activeItinerary={activeItinerary}
            onSelect={handleSelectItinerary}
            onCreateNew={() => setIsCreateDialogOpen(true)}
          />
        </div>

        {/* Empty state - no itinerary selected */}
        {!activeItinerary && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-10 h-10 text-pink-400" />
            </div>
            <h3 className="text-lg font-bold text-violet-900 mb-2">Create Your First Itinerary</h3>
            <p className="text-violet-500 text-sm max-w-xs mb-6">
              Plan your perfect trip with AI-generated day-by-day schedules
            </p>
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              New Itinerary
            </button>
          </div>
        )}

        {/* Active itinerary content */}
        {activeItinerary && (
          <div className="space-y-6">
            {/* Itinerary header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-violet-900">{activeItinerary.name}</h3>
                {activeItinerary.vibe && (
                  <p className="text-violet-500 text-sm">{activeItinerary.vibe}</p>
                )}
              </div>
              <button
                onClick={handleDeleteItinerary}
                className="p-2 text-violet-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete itinerary"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Generated plan view */}
            {generatedPlan && generatedPlan.length > 0 ? (
              <div className="space-y-4">
                {/* Summary */}
                <div className="p-4 bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-200/50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-violet-900">
                      {activeItinerary.tripDuration} Day Itinerary
                    </span>
                    <span className="text-xs text-violet-500">
                      {uniqueLocations.length} location{uniqueLocations.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {uniqueLocations.map((location, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getLocationColor(location)}`}
                      >
                        {location}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Day cards */}
                <div className="space-y-3">
                  {generatedPlan.map((day) => (
                    <DayCardCompact
                      key={day.dayNumber}
                      day={day}
                      isExpanded={expandedDays.has(day.dayNumber)}
                      onToggle={() => toggleDay(day.dayNumber)}
                      locationColor={getLocationColor(day.location)}
                    />
                  ))}
                </div>

                {/* Regenerate button */}
                <button
                  onClick={() => setIsTripPlannerOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-violet-300 text-violet-700 font-medium rounded-lg hover:bg-violet-50 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Edit or Regenerate
                </button>
              </div>
            ) : (
              /* Destinations list (no plan generated yet) */
              <div className="space-y-4">
                {destinations.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-violet-300 mx-auto mb-3" />
                    <p className="text-violet-500 text-sm">
                      Add destinations from search results to start planning
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Destination cards */}
                    <div className="space-y-3">
                      {destinations.map((destination, index) => {
                        const isSelected =
                          selectedDestination?.region === destination.region &&
                          selectedDestination?.country === destination.country

                        return (
                          <div
                            key={index}
                            className={`relative group bg-white rounded-xl transition-all duration-300 shadow-sm border-2 ${
                              isSelected
                                ? 'ring-2 ring-pink-400 shadow-md shadow-pink-100 border-pink-200'
                                : 'hover:shadow-lg hover:shadow-violet-200/50 border-violet-200/60 hover:border-violet-300'
                            }`}
                          >
                            <div
                              onClick={() => onDestinationClick(destination)}
                              className="cursor-pointer p-4 pr-10"
                            >
                              <h4 className="font-semibold text-violet-900">
                                {destination.region || getCountryName(destination.country)}
                              </h4>
                              <div className="flex items-center gap-1 text-violet-500 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                <span className="text-xs font-medium">
                                  {getCountryName(destination.country)}
                                </span>
                              </div>
                              {destination.recommendedDuration && (
                                <p className="text-xs text-violet-400 mt-1">
                                  {destination.recommendedDuration} days recommended
                                </p>
                              )}
                            </div>
                            <button
                              onClick={(e) => handleRemoveDestination(destination, e)}
                              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/80 opacity-0 group-hover:opacity-100 hover:bg-rose-50 text-violet-400 hover:text-rose-500 transition-all shadow-sm"
                              aria-label="Remove from itinerary"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      })}
                    </div>

                    {/* Generate button */}
                    <button
                      onClick={() => setIsTripPlannerOpen(true)}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Sparkles className="w-5 h-5" />
                      Generate Day-by-Day Plan
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trip Planner Modal */}
      <TripPlannerModal
        isOpen={isTripPlannerOpen}
        onClose={() => setIsTripPlannerOpen(false)}
        itinerary={activeItinerary}
        onItineraryUpdated={refreshItineraries}
      />

      {/* Create Itinerary Dialog */}
      <CreateItineraryDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={handleCreateItinerary}
        currentVibe={currentVibe}
      />
    </div>
  )
}

function DayCardCompact({
  day,
  isExpanded,
  onToggle,
  locationColor,
}: {
  day: GeneratedDay
  isExpanded: boolean
  onToggle: () => void
  locationColor: string
}) {
  const isTravel =
    day.location.toLowerCase().includes('travel') ||
    day.morning.activity.toLowerCase().includes('travel') ||
    day.morning.activity.toLowerCase().includes('flight') ||
    day.morning.activity.toLowerCase().includes('arrive')

  return (
    <div className="bg-white border border-violet-200/60 rounded-xl overflow-hidden transition-all duration-300 hover:border-violet-300">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-violet-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
            {day.dayNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${locationColor}`}>
                {day.location}
              </span>
              {isTravel && <Plane className="w-3 h-3 text-violet-400" />}
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-violet-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-violet-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          <TimeSlotCompact
            icon={<Sun className="w-3.5 h-3.5 text-amber-500" />}
            label="Morning"
            activity={day.morning.activity}
            description={day.morning.description}
          />
          <TimeSlotCompact
            icon={<CloudSun className="w-3.5 h-3.5 text-orange-400" />}
            label="Midday"
            activity={day.midday.activity}
            description={day.midday.description}
          />
          <TimeSlotCompact
            icon={<Moon className="w-3.5 h-3.5 text-indigo-400" />}
            label="Evening"
            activity={day.evening.activity}
            description={day.evening.description}
          />
        </div>
      )}
    </div>
  )
}

function TimeSlotCompact({
  icon,
  label,
  activity,
  description,
}: {
  icon: React.ReactNode
  label: string
  activity: string
  description: string
}) {
  return (
    <div className="flex gap-2 p-2.5 bg-violet-50/50 rounded-lg">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-medium text-violet-500 uppercase tracking-wide">{label}</span>
        <p className="font-medium text-violet-900 text-sm">{activity}</p>
        {description && <p className="text-xs text-violet-600 mt-0.5 line-clamp-2">{description}</p>}
      </div>
    </div>
  )
}
