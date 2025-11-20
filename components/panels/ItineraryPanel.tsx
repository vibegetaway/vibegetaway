'use client'

import { useState, useEffect } from 'react'
import { Destination } from '@/lib/generateDestinationInfo'
import { getCountryName } from '@/lib/countryCodeMapping'
import { MapPin, X, Trash2, Plane, Calendar } from 'lucide-react'
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
    if (window.confirm('Are you sure you want to clear your entire itinerary?')) {
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
      className={`fixed left-20 top-0 h-screen w-full max-w-md bg-white/95 backdrop-blur-md border-r border-stone-200 shadow-2xl z-40 transition-transform duration-300 ease-in-out overflow-y-auto pointer-events-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
    >
      {/* Spacer for text input */}


      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 mb-1 tracking-tight">My Itinerary</h2>
            <p className="text-stone-500 text-xs font-medium">
              {itineraryItems.length === 0
                ? 'No destinations added yet'
                : `${itineraryItems.length} ${itineraryItems.length === 1 ? 'destination' : 'destinations'} in your plan`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Clear all button */}
        {itineraryItems.length > 0 && (
          <div className="mb-6">
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        )}

        {/* Empty state */}
        {itineraryItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2">Your plan is empty</h3>
            <p className="text-stone-500 text-sm max-w-xs">
              Start adding destinations to your itinerary by clicking the calendar icon on destination cards
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
                    ? 'ring-2 ring-amber-500 shadow-md shadow-amber-100 border-amber-200'
                    : 'hover:shadow-lg hover:shadow-stone-200/50 border-stone-200/60 hover:border-stone-300'
                    }`}
                >
                  <div
                    onClick={() => onDestinationClick(destination)}
                    className="cursor-pointer p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-stone-900 leading-tight">{destination.region}</h3>
                        <div className="flex items-center gap-1 text-stone-500 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs font-medium tracking-wide uppercase">
                            {getCountryName(destination.country)}
                          </span>
                        </div>
                      </div>

                      {/* Added Date Badge */}
                      <span className="text-[10px] text-stone-400 font-medium bg-stone-50 px-1.5 py-0.5 rounded-md border border-stone-100">
                        Added {formatAddedDate(item.addedAt)}
                      </span>
                    </div>

                    {/* Description with Markdown */}
                    {descriptionText && (
                      <div className="prose prose-xs prose-stone max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-strong:text-amber-700 prose-li:marker:text-amber-500 mb-3">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {descriptionText}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Pricing Info */}
                    {dailyCost > 0 && (
                      <div className="flex items-center pt-2 border-t border-stone-100">
                        <span className="text-xs font-semibold text-stone-700">
                          Est. <span className="text-amber-600">${dailyCost}</span> / day
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={(e) => handleRemove(item.id, e)}
                    className="absolute top-3 right-3 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 text-stone-400 hover:text-red-500 transition-all"
                    aria-label="Remove from itinerary"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}

            {/* Plan My Trip Button */}
            {itineraryItems.length > 0 && (
              <div className="mt-8 pb-8">
                <button
                  onClick={() => setIsTripPlannerOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plane className="w-5 h-5" />
                  Plan My Trip
                </button>
                <p className="text-xs text-center text-stone-500 mt-3">
                  Ready to finalize? View your complete multi-city itinerary
                </p>
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
