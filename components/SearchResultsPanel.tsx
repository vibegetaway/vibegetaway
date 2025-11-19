'use client'

import { useState, useEffect } from 'react'
import { Destination } from '@/lib/generateDestinationInfo'
import { MapPin, X, Loader2, Heart, Calendar } from 'lucide-react'
import { addToItinerary, isInItinerary } from '@/lib/itinerary'
import { addToFavorites, isInFavorites } from '@/lib/favorites'

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

  const showPanel = loading || destinations.length > 0

  if (!showPanel) {
    return null
  }

  return (
    <div
      className={`fixed left-20 top-0 h-screen w-full max-w-md bg-stone-50 border-r border-amber-200/50 shadow-2xl z-40 transition-transform duration-300 ease-in-out overflow-y-auto pointer-events-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Spacer for text input */}
      <div className="h-24"></div>
      
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold text-stone-900 mb-2">
              {loading && destinations.length === 0 ? 'Searching...' : 'Search Results'}
            </h2>
            <p className="text-stone-600">
              {loading && destinations.length === 0
                ? 'Finding the best destinations for you'
                : `${destinations.length} ${destinations.length === 1 ? 'destination' : 'destinations'} found`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-amber-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-stone-600" />
          </button>
        </div>

        {/* Loading state */}
        {loading && destinations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-16 h-16 text-amber-600 animate-spin mb-4" />
            <p className="text-stone-600">Searching destinations...</p>
          </div>
        ) : (
          /* Results list */
          <div className="space-y-3">
            {destinations.map((destination, index) => {
              const isSelected = selectedDestination?.region === destination.region && 
                               selectedDestination?.country === destination.country
              const hasDetails = destination.description && destination.pricing
              const destKey = `${destination.country}-${destination.region}`
              const inItinerary = itineraryStates[destKey] || false
              const inFavorites = favoritesStates[destKey] || false

              return (
                <div
                  key={`${destination.country}-${destination.region}-${index}`}
                  className={`relative group w-full p-4 bg-white hover:bg-amber-50/50 border border-amber-200/50 hover:border-amber-300 rounded-lg transition-all ${
                    isSelected ? 'bg-amber-50 border-amber-400' : ''
                  }`}
                >
                  <button
                    onClick={() => onDestinationClick(destination)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start gap-3">
                      {/* Pin icon */}
                      <div className="flex-shrink-0 mt-1">
                        <MapPin className={`w-5 h-5 ${isSelected ? 'text-amber-700' : hasDetails ? 'text-orange-500' : 'text-orange-300'}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-16">
                        <h3 className="font-bold text-stone-900 mb-1">
                          {destination.region}
                        </h3>
                        <p className="text-sm text-stone-600 mb-2">
                          {destination.country}
                        </p>

                        {/* Loading indicator for details */}
                        {!hasDetails && (
                          <div className="flex items-center gap-2 mt-2">
                            <Loader2 className="w-3 h-3 text-amber-600 animate-spin" />
                            <span className="text-xs text-amber-600">Loading details...</span>
                          </div>
                        )}

                        {/* Show snippet if available */}
                        {hasDetails && destination.description && (
                          <p className="text-sm text-stone-700 mt-1 line-clamp-2">
                            {destination.description}
                          </p>
                        )}

                        {/* Pricing preview */}
                        {hasDetails && destination.pricing && (
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                              {destination.pricing.accommodation}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Action buttons */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!inFavorites) {
                          addToFavorites(destination)
                        }
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        inFavorites 
                          ? 'bg-red-50' 
                          : 'hover:bg-gray-100'
                      }`}
                      disabled={inFavorites}
                      aria-label={inFavorites ? 'In favorites' : 'Add to favorites'}
                    >
                      <Heart className={`w-4 h-4 transition-colors ${
                        inFavorites ? 'text-red-500 fill-red-500' : 'text-gray-600'
                      }`} />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!inItinerary) {
                          addToItinerary(destination)
                        }
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        inItinerary 
                          ? 'bg-green-50' 
                          : 'hover:bg-gray-100'
                      }`}
                      disabled={inItinerary}
                      aria-label={inItinerary ? 'In itinerary' : 'Add to itinerary'}
                    >
                      <Calendar className={`w-4 h-4 transition-colors ${
                        inItinerary ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    </button>
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

