'use client'

import { useState, useEffect } from 'react'
import { Destination } from '@/lib/generateDestinationInfo'
import { X, MapPin, Calendar, Minus, Plus, Sparkles, Loader2, ChevronDown, ChevronUp, Sun, CloudSun, Moon, Plane, Check } from 'lucide-react'
import { getCountryName } from '@/lib/countryCodeMapping'
import { 
  type Itinerary, 
  type GeneratedDay,
  suggestTripDuration,
  setGeneratedPlan,
  getActiveItinerary,
  updateItinerary
} from '@/lib/itinerary'

interface TripPlannerModalProps {
  isOpen: boolean
  onClose: () => void
  itinerary: Itinerary | null
  onItineraryUpdated?: () => void
}

type ViewPhase = 'setup' | 'generating' | 'results'

export function TripPlannerModal({ isOpen, onClose, itinerary, onItineraryUpdated }: TripPlannerModalProps) {
  const [phase, setPhase] = useState<ViewPhase>('setup')
  const [tripDuration, setTripDuration] = useState(7)
  const [itineraryName, setItineraryName] = useState('')
  const [generatedPlan, setGeneratedPlanState] = useState<GeneratedDay[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (isOpen && itinerary) {
      const suggested = suggestTripDuration(itinerary.destinations)
      setTripDuration(itinerary.tripDuration || suggested)
      setItineraryName(itinerary.name)
      
      if (itinerary.generatedPlan && itinerary.generatedPlan.length > 0) {
        setGeneratedPlanState(itinerary.generatedPlan)
        setPhase('results')
        setExpandedDays(new Set([1]))
      } else {
        setGeneratedPlanState(null)
        setPhase('setup')
        setExpandedDays(new Set())
      }
      setError(null)
    }
  }, [isOpen, itinerary])

  if (!isOpen || !itinerary) return null

  const destinations = itinerary.destinations

  const handleGenerate = async () => {
    if (destinations.length === 0) {
      setError('Add at least one destination to generate an itinerary')
      return
    }

    setPhase('generating')
    setError(null)

    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinations: destinations.map(d => ({
            region: d.region,
            country: d.country,
            recommendedDuration: d.recommendedDuration,
          })),
          tripDuration,
          vibe: itinerary.vibe || 'exploration and adventure',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate itinerary')
      }

      setGeneratedPlanState(data.plan)
      setGeneratedPlan(itinerary.id, data.plan, tripDuration)
      
      if (itineraryName !== itinerary.name) {
        updateItinerary(itinerary.id, { name: itineraryName })
      }
      
      setPhase('results')
      setExpandedDays(new Set([1]))
      onItineraryUpdated?.()
    } catch (err) {
      console.error('Error generating itinerary:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate itinerary')
      setPhase('setup')
    }
  }

  const handleSaveAndClose = () => {
    if (itineraryName !== itinerary.name) {
      updateItinerary(itinerary.id, { name: itineraryName })
    }
    onItineraryUpdated?.()
    onClose()
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

  const expandAllDays = () => {
    if (generatedPlan) {
      setExpandedDays(new Set(generatedPlan.map(d => d.dayNumber)))
    }
  }

  const collapseAllDays = () => {
    setExpandedDays(new Set())
  }

  const uniqueLocations = generatedPlan 
    ? Array.from(new Set(generatedPlan.map(d => d.location)))
    : []

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-violet-200/50 bg-gradient-to-r from-violet-50 to-pink-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {phase === 'setup' ? (
                <input
                  type="text"
                  value={itineraryName}
                  onChange={(e) => setItineraryName(e.target.value)}
                  className="text-2xl font-bold text-violet-900 bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                  placeholder="Name your trip..."
                />
              ) : (
                <h2 className="text-2xl font-bold text-violet-900">{itineraryName}</h2>
              )}
              <p className="text-violet-500 text-sm mt-1">
                {destinations.length} {destinations.length === 1 ? 'destination' : 'destinations'}
                {generatedPlan && ` • ${tripDuration} days`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-violet-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-violet-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {phase === 'setup' && (
            <SetupPhase
              destinations={destinations}
              tripDuration={tripDuration}
              setTripDuration={setTripDuration}
              error={error}
              itineraryVibe={itinerary.vibe}
            />
          )}

          {phase === 'generating' && (
            <GeneratingPhase destinations={destinations} />
          )}

          {phase === 'results' && generatedPlan && (
            <ResultsPhase
              plan={generatedPlan}
              expandedDays={expandedDays}
              toggleDay={toggleDay}
              expandAllDays={expandAllDays}
              collapseAllDays={collapseAllDays}
              uniqueLocations={uniqueLocations}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-violet-200/50 bg-violet-50/50">
          {phase === 'setup' && (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-violet-300 text-violet-700 font-medium rounded-lg hover:bg-violet-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={destinations.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5" />
                Generate Itinerary
              </button>
            </div>
          )}

          {phase === 'generating' && (
            <div className="text-center text-violet-500 text-sm">
              This may take up to 30 seconds...
            </div>
          )}

          {phase === 'results' && (
            <div className="flex gap-3">
              <button
                onClick={() => setPhase('setup')}
                className="flex-1 px-6 py-3 border border-violet-300 text-violet-700 font-medium rounded-lg hover:bg-violet-100 transition-colors"
              >
                Regenerate
              </button>
              <button
                onClick={handleSaveAndClose}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg"
              >
                <Check className="w-5 h-5" />
                Save & Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SetupPhase({
  destinations,
  tripDuration,
  setTripDuration,
  error,
  itineraryVibe,
}: {
  destinations: Destination[]
  tripDuration: number
  setTripDuration: (duration: number) => void
  error: string | null
  itineraryVibe: string
}) {
  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Destinations summary */}
      <div>
        <h3 className="text-lg font-semibold text-violet-900 mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-pink-500" />
          Destinations
        </h3>
        {destinations.length === 0 ? (
          <p className="text-violet-500 text-sm">No destinations added yet. Add destinations from the search results.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {destinations.map((dest, index) => (
              <div
                key={index}
                className="px-3 py-2 bg-violet-100 text-violet-800 rounded-lg text-sm font-medium"
              >
                {dest.region || getCountryName(dest.country)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Duration selector */}
      <div>
        <h3 className="text-lg font-semibold text-violet-900 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-pink-500" />
          Trip Duration
        </h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTripDuration(Math.max(1, tripDuration - 1))}
            className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-violet-300 text-violet-600 hover:bg-violet-100 transition-colors"
          >
            <Minus className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center">
            <span className="text-4xl font-bold text-violet-900">{tripDuration}</span>
            <span className="text-violet-500 ml-2">days</span>
          </div>
          <button
            onClick={() => setTripDuration(Math.min(60, tripDuration + 1))}
            className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-violet-300 text-violet-600 hover:bg-violet-100 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-violet-500 text-sm mt-2">
          Suggested based on {destinations.length} destination{destinations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Vibe context */}
      {itineraryVibe && (
        <div className="p-4 bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-200 rounded-lg">
          <p className="text-sm text-violet-700">
            <span className="font-semibold">Trip focus:</span> {itineraryVibe}
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="p-4 bg-violet-50 border border-violet-200/50 rounded-lg">
        <h4 className="font-semibold text-violet-900 mb-2">What to expect</h4>
        <ul className="space-y-1.5 text-sm text-violet-700">
          <li className="flex items-start gap-2">
            <span className="text-pink-500 mt-0.5">•</span>
            <span>Day-by-day breakdown with morning, midday, and evening activities</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500 mt-0.5">•</span>
            <span>Smart time allocation across your destinations</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500 mt-0.5">•</span>
            <span>Travel days included between locations</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

function GeneratingPhase({ destinations }: { destinations: Destination[] }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-gradient-to-r from-pink-100 to-violet-100 rounded-full flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-pink-500" />
        </div>
        <div className="absolute inset-0 w-20 h-20 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
      <h3 className="text-xl font-bold text-violet-900 mb-2">Creating your itinerary...</h3>
      <p className="text-violet-500 text-sm text-center max-w-sm">
        Planning the perfect {destinations.length}-destination adventure with activities for each day
      </p>
    </div>
  )
}

function ResultsPhase({
  plan,
  expandedDays,
  toggleDay,
  expandAllDays,
  collapseAllDays,
  uniqueLocations,
}: {
  plan: GeneratedDay[]
  expandedDays: Set<number>
  toggleDay: (day: number) => void
  expandAllDays: () => void
  collapseAllDays: () => void
  uniqueLocations: string[]
}) {
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
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center justify-between mb-4">
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
        <div className="flex gap-2">
          <button
            onClick={expandAllDays}
            className="text-xs text-violet-600 hover:text-violet-800 transition-colors"
          >
            Expand all
          </button>
          <span className="text-violet-300">|</span>
          <button
            onClick={collapseAllDays}
            className="text-xs text-violet-600 hover:text-violet-800 transition-colors"
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* Day cards */}
      <div className="space-y-3">
        {plan.map((day) => (
          <DayCard
            key={day.dayNumber}
            day={day}
            isExpanded={expandedDays.has(day.dayNumber)}
            onToggle={() => toggleDay(day.dayNumber)}
            locationColor={getLocationColor(day.location)}
          />
        ))}
      </div>
    </div>
  )
}

function DayCard({
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
  const isTravel = day.location.toLowerCase().includes('travel') || 
                   day.morning.activity.toLowerCase().includes('travel') ||
                   day.morning.activity.toLowerCase().includes('flight') ||
                   day.morning.activity.toLowerCase().includes('arrive')

  return (
    <div className="bg-white border border-violet-200/60 rounded-xl overflow-hidden transition-all duration-300 hover:border-violet-300 hover:shadow-md">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-violet-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
            {day.dayNumber}
          </div>
          <div>
            <h4 className="font-semibold text-violet-900">Day {day.dayNumber}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${locationColor}`}>
                {day.location}
              </span>
              {isTravel && (
                <Plane className="w-3 h-3 text-violet-400" />
              )}
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-violet-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-violet-400" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          <TimeSlot
            icon={<Sun className="w-4 h-4 text-amber-500" />}
            label="Morning"
            activity={day.morning.activity}
            description={day.morning.description}
          />
          <TimeSlot
            icon={<CloudSun className="w-4 h-4 text-orange-400" />}
            label="Midday"
            activity={day.midday.activity}
            description={day.midday.description}
          />
          <TimeSlot
            icon={<Moon className="w-4 h-4 text-indigo-400" />}
            label="Evening"
            activity={day.evening.activity}
            description={day.evening.description}
          />
        </div>
      )}
    </div>
  )
}

function TimeSlot({
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
    <div className="flex gap-3 p-3 bg-violet-50/50 rounded-lg">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-violet-500 uppercase tracking-wide">{label}</span>
        </div>
        <p className="font-medium text-violet-900 mt-0.5">{activity}</p>
        {description && (
          <p className="text-sm text-violet-600 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  )
}
