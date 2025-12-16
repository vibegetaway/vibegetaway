'use client'

import { useState, useEffect } from 'react'
import { Destination } from '@/lib/generateDestinationInfo'
import { getCountryName } from '@/lib/countryCodeMapping'
import { MapPin, X, Trash2, Route, Calendar } from 'lucide-react'
import { getItinerary, removeFromItinerary, clearItinerary, formatAddedDate, type ItineraryItem } from '@/lib/itinerary'
import { TripPlannerModal } from './TripPlannerModal'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ItineraryPanelProps {
  isOpen: boolean
  onClose: () => void
  onDestinationClick: (destination: Destination) => void
  selectedDestination: Destination | null
}

export function ItineraryPanel({
  isOpen,
  onClose,
  onDestinationClick,
  selectedDestination,
}: ItineraryPanelProps) {
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([])
  const [isTripPlannerOpen, setIsTripPlannerOpen] = useState(false)

  // Load itinerary from local storage
  useEffect(() => {
    setItineraryItems(getItinerary())

    // Listen for itinerary updates from other components
    const handleItineraryUpdate = (event: CustomEvent) => {
      setItineraryItems(event.detail)
    }

    window.addEventListener('itineraryUpdated' as any, handleItineraryUpdate)

    return () => {
      window.removeEventListener('itineraryUpdated' as any, handleItineraryUpdate)
    }
  }, [])

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeFromItinerary(id)
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your entire trip plan?')) {
      clearItinerary()
    }
  }

  // Helper to parse pricing values
  function parsePricing(value: string | number): number {
    if (typeof value === 'number') return value
    const strValue = String(value)
    const match = strValue.match(/(\d+)/)
    return match ? parseInt(match[1], 10) : 0
  }

  // Calculate total estimated cost
  const totalEstimatedCost = itineraryItems.reduce((sum, item) => {
    const dest = item.destination
    if (!dest.pricing) return sum

    const accommodationPrice = parsePricing(dest.pricing.accommodation || 0)
    const foodPrice = parsePricing(dest.pricing.food || 0)
    const activitiesPrice = parsePricing(dest.pricing.activities || 0)

    return sum + accommodationPrice + foodPrice + activitiesPrice
  }, 0)

  return (
    <div
      className={`fixed left-16 top-0 h-screen w-full max-w-md bg-white/95 backdrop-blur-md border-r border-violet-200 shadow-2xl z-40 transition-transform duration-300 ease-in-out overflow-y-auto pointer-events-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
    >
      {/* Spacer for text input */}


      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-violet-900 mb-1 tracking-tight">Trip Plan</h2>
            <p className="text-violet-500 text-xs font-medium">
              {itineraryItems.length === 0
                ? 'Start building your trip'
                : `${itineraryItems.length} ${itineraryItems.length === 1 ? 'destination' : 'destinations'} added`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-violet-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-violet-500" />
          </button>
        </div>

        {/* Clear all button */}
        {itineraryItems.length > 0 && (
          <div className="mb-6">
            <button
              onClick={handleClearAll}
              className="text-xs text-red-500 hover:text-red-600 hover:underline transition-colors"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Empty state */}
        {itineraryItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-10 h-10 text-pink-400" />
            </div>
            <h3 className="text-lg font-bold text-violet-900 mb-2">Start Planning Your Trip</h3>
            <p className="text-violet-500 text-sm max-w-xs">
              Add destinations to your plan by clicking "Add to Plan" on any destination
            </p>
          </div>
        ) : (
          /* Itinerary list */
          <div className="space-y-6">
            {itineraryItems.map((item) => {
              const destination = item.destination
              const isSelected =
                selectedDestination?.region === destination.region &&
                selectedDestination?.country === destination.country

              // Calculate daily cost
              let dailyCost = 0
              if (destination.pricing) {
                const accommodationPrice = parsePricing(destination.pricing.accommodation || 0)
                const foodPrice = parsePricing(destination.pricing.food || 0)
                const activitiesPrice = parsePricing(destination.pricing.activities || 0)
                dailyCost = accommodationPrice + foodPrice + activitiesPrice
              }

              // Prepare description for markdown
              const descriptionText = Array.isArray(destination.description)
                ? destination.description[0] || ''
                : destination.description || ''

              return (
                <div
                  key={item.id}
                  className={`relative group w-full bg-white rounded-xl transition-all duration-300 shadow-sm border-2 ${isSelected
                    ? 'ring-2 ring-pink-400 shadow-md shadow-pink-100 border-pink-200'
                    : 'hover:shadow-lg hover:shadow-violet-200/50 border-violet-200/60 hover:border-violet-300'
                    }`}
                >
                  <div
                    onClick={() => onDestinationClick(destination)}
                    className="cursor-pointer p-4 pr-10"
                  >
                    <div className="mb-2">
                      <h3 className="text-lg font-bold text-violet-900 leading-tight">{destination.region}</h3>
                      <div className="flex items-center gap-1 text-violet-500 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span className="text-xs font-medium tracking-wide uppercase">
                          {getCountryName(destination.country)}
                        </span>
                      </div>
                    </div>

                    {/* Description with Markdown */}
                    {descriptionText && (
                      <div className="prose prose-xs prose-violet max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-strong:text-pink-600 prose-li:marker:text-pink-400">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {descriptionText}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={(e) => handleRemove(item.id, e)}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-white/80 opacity-0 group-hover:opacity-100 hover:bg-rose-50 text-violet-400 hover:text-rose-500 transition-all shadow-sm"
                    aria-label="Remove from itinerary"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}

            {/* Plan My Trip Button */}
            {itineraryItems.length > 0 && (
              <div className="mt-8 pb-8">
                <button
                  onClick={() => setIsTripPlannerOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Route className="w-5 h-5" />
                  Create Itinerary
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trip Planner Modal */}
      <TripPlannerModal
        isOpen={isTripPlannerOpen}
        onClose={() => setIsTripPlannerOpen(false)}
        itineraryItems={itineraryItems}
      />
    </div>
  )
}
