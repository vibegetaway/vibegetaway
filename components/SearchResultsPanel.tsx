'use client'

import { useState, useEffect } from 'react'
import { Destination } from '@/lib/generateDestinationInfo'
import { MapPin, X, Loader2, Heart, Calendar } from 'lucide-react'
import { addToItinerary, isInItinerary } from '@/lib/itinerary'
import { addToFavorites, isInFavorites } from '@/lib/favorites'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface SearchResultsPanelProps {
  destinations: Destination[]
  loading: boolean
  onDestinationClick: (destination: Destination) => void
  selectedDestination: Destination | null
  isOpen: boolean
  onClose: () => void
}

export function SearchResultsPanel({
  destinations,
  loading,
  onDestinationClick,
  selectedDestination,
  isOpen,
  onClose,
}: SearchResultsPanelProps) {
  const [itineraryStates, setItineraryStates] = useState<Record<string, boolean>>({})
  const [favoritesStates, setFavoritesStates] = useState<Record<string, boolean>>({})

  // Update states when destinations change
  useEffect(() => {
    const newItineraryStates: Record<string, boolean> = {}
    const newFavoritesStates: Record<string, boolean> = {}

    destinations.forEach(dest => {
      const key = `${dest.country}-${dest.region}`
      newItineraryStates[key] = isInItinerary(dest)
      newFavoritesStates[key] = isInFavorites(dest)
    })

    setItineraryStates(newItineraryStates)
    setFavoritesStates(newFavoritesStates)
  }, [destinations])

  // Listen for updates
  useEffect(() => {
    const handleItineraryUpdate = () => {
      const newStates: Record<string, boolean> = {}
      destinations.forEach(dest => {
        const key = `${dest.country}-${dest.region}`
        newStates[key] = isInItinerary(dest)
      })
      setItineraryStates(newStates)
    }

    const handleFavoritesUpdate = () => {
      const newStates: Record<string, boolean> = {}
      destinations.forEach(dest => {
        const key = `${dest.country}-${dest.region}`
        newStates[key] = isInFavorites(dest)
      })
      setFavoritesStates(newStates)
    }

    window.addEventListener('itineraryUpdated' as any, handleItineraryUpdate)
    window.addEventListener('favoritesUpdated' as any, handleFavoritesUpdate)

    return () => {
      window.removeEventListener('itineraryUpdated' as any, handleItineraryUpdate)
      window.removeEventListener('favoritesUpdated' as any, handleFavoritesUpdate)
    }
  }, [destinations])

  // Helper to parse pricing values
  function parsePricing(value: string | number): number {
    if (typeof value === 'number') return value
    const strValue = String(value)
    const match = strValue.match(/(\d+)/)
    return match ? parseInt(match[1], 10) : 0
  }

  const showPanel = loading || destinations.length > 0

  if (!showPanel) {
    return null
  }

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
            <h2 className="text-2xl font-bold text-stone-900 mb-1 tracking-tight">
              {loading && destinations.length === 0 ? 'Searching...' : 'Results'}
            </h2>
            <p className="text-stone-500 text-xs font-medium">
              {loading && destinations.length === 0
                ? 'Curating the perfect trip for you'
                : `${destinations.length} ${destinations.length === 1 ? 'gem' : 'gems'} found`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Loading state */}
        {loading && destinations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <p className="text-stone-500 text-sm font-medium">Finding destinations...</p>
          </div>
        ) : (
          /* Results list */
          <div className="space-y-6">
            {destinations.map((destination, index) => {
              const isSelected = selectedDestination?.region === destination.region &&
                selectedDestination?.country === destination.country
              const hasDetails = destination.description && destination.pricing
              const destKey = `${destination.country}-${destination.region}`
              const inItinerary = itineraryStates[destKey] || false
              const inFavorites = favoritesStates[destKey] || false

              // Prepare description for markdown - ONLY FIRST ITEM
              const descriptionText = Array.isArray(destination.description)
                ? destination.description[0] || ''
                : destination.description || ''

              // Calculate total daily cost
              let totalDailyCost = 0
              if (destination.pricing) {
                const accommodationPrice = parsePricing(destination.pricing.accommodation || 0)
                const foodPrice = parsePricing(destination.pricing.food || 0)
                const activitiesPrice = parsePricing(destination.pricing.activities || 0)
                totalDailyCost = accommodationPrice + foodPrice + activitiesPrice
              }

              return (
                <div
                  key={`${destination.country}-${destination.region}-${index}`}
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
                        <h3 className="text-lg font-bold text-stone-900 leading-tight">
                          {destination.region}
                        </h3>
                        <div className="flex items-center gap-1 text-stone-500 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs font-medium tracking-wide uppercase">{destination.country}</span>
                        </div>
                      </div>

                      {/* Action Icons - Always Visible */}
                      {hasDetails && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!inFavorites) addToFavorites(destination)
                            }}
                            disabled={inFavorites}
                            className={`p-1.5 rounded-full transition-colors ${inFavorites
                              ? 'bg-red-50 cursor-default'
                              : 'bg-stone-50 hover:bg-red-50 hover:scale-110'
                              }`}
                            title={inFavorites ? 'Already in favorites' : 'Add to favorites'}
                          >
                            <Heart className={`w-3.5 h-3.5 ${inFavorites ? 'text-red-500 fill-red-500' : 'text-stone-400 hover:text-red-500'}`} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!inItinerary) addToItinerary(destination)
                            }}
                            disabled={inItinerary}
                            className={`p-1.5 rounded-full transition-colors ${inItinerary
                              ? 'bg-green-50 cursor-default'
                              : 'bg-stone-50 hover:bg-green-50 hover:scale-110'
                              }`}
                            title={inItinerary ? 'Already in itinerary' : 'Add to itinerary'}
                          >
                            <Calendar className={`w-3.5 h-3.5 ${inItinerary ? 'text-green-600 fill-green-600' : 'text-stone-400 hover:text-green-600'}`} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Loading indicator for details */}
                    {!hasDetails && (
                      <div className="flex items-center gap-2 py-2">
                        <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />
                        <span className="text-xs text-stone-500">Loading details...</span>
                      </div>
                    )}

                    {/* Content */}
                    {hasDetails && (
                      <div className="space-y-3">
                        {/* Description with Markdown - Full Text */}
                        <div className="prose prose-xs prose-stone max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-strong:text-amber-700 prose-li:marker:text-amber-500">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {descriptionText}
                          </ReactMarkdown>
                        </div>

                        {/* Total Price Only */}
                        {totalDailyCost > 0 && (
                          <div className="flex items-center pt-2 border-t border-stone-100">
                            <span className="text-xs font-semibold text-stone-700">
                              Est. <span className="text-amber-600">${totalDailyCost}</span> / day
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
