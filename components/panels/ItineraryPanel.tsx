'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, X, Trash2, Sparkles } from 'lucide-react'
import { Destination } from '@/lib/generateDestinationInfo'
import { getCountryName } from '@/lib/countryCodeMapping'
import { getSavedLocations, removeFromSavedLocations } from '@/lib/itinerary'

interface ItineraryPanelProps {
  isOpen: boolean
  onClose: () => void
  onDestinationClick?: (destination: Destination) => void
  selectedDestination?: Destination | null
}

export function ItineraryPanel({
  isOpen,
  onClose,
  onDestinationClick,
  selectedDestination,
}: ItineraryPanelProps) {
  const router = useRouter()
  const [savedLocations, setSavedLocations] = useState<Destination[]>([])

  const refreshLocations = () => {
    setSavedLocations(getSavedLocations())
  }

  const handlePlanTrip = () => {
    router.push('/plan')
  }

  useEffect(() => {
    refreshLocations()

    const handleLocationsUpdate = () => {
      refreshLocations()
    }

    window.addEventListener('locationsUpdated', handleLocationsUpdate)
    return () => window.removeEventListener('locationsUpdated', handleLocationsUpdate)
  }, [])

  const handleRemoveLocation = (destination: Destination, e: React.MouseEvent) => {
    e.stopPropagation()
    removeFromSavedLocations(destination)
  }

  return (
    <div
      className={`fixed left-0 md:left-16 top-0 h-screen w-[28rem] bg-white/95 backdrop-blur-md border-r border-violet-200 shadow-2xl z-40 transition-transform duration-300 ease-in-out overflow-y-auto pointer-events-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-violet-900 mb-1 tracking-tight">Itinerary Planner</h2>
            <p className="text-violet-500 text-xs font-medium">
              {savedLocations.length === 0
                ? 'Add locations to start planning'
                : `${savedLocations.length} location${savedLocations.length !== 1 ? 's' : ''} saved`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-violet-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-violet-500" />
          </button>
        </div>

        {/* Empty state */}
        {savedLocations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-10 h-10 text-pink-400" />
            </div>
            <h3 className="text-lg font-bold text-violet-900 mb-2">Start Planning</h3>
            <p className="text-violet-500 text-sm max-w-xs mb-6">
              Add locations from search results to build your travel itinerary
            </p>
          </div>
        ) : (
          /* Saved locations list */
          <div className="space-y-4">
            <div className="space-y-3">
              {savedLocations.map((destination, index) => {
                const isSelected =
                  selectedDestination?.region === destination.region &&
                  selectedDestination?.country === destination.country

                return (
                  <div
                    key={index}
                    className={`relative group bg-white rounded-xl transition-all duration-300 shadow-sm border-2 ${isSelected
                        ? 'ring-2 ring-pink-400 shadow-md shadow-pink-100 border-pink-200'
                        : 'hover:shadow-lg hover:shadow-violet-200/50 border-violet-200/60 hover:border-violet-300'
                      }`}
                  >
                    <div
                      onClick={() => onDestinationClick?.(destination)}
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
                      onClick={(e) => handleRemoveLocation(destination, e)}
                      className="absolute top-4 right-4 p-1.5 rounded-full bg-white/80 opacity-0 group-hover:opacity-100 hover:bg-rose-50 text-violet-400 hover:text-rose-500 transition-all shadow-sm"
                      aria-label="Remove from itinerary"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Plan Trip Button */}
            <button
              onClick={handlePlanTrip}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5" />
              Plan this Trip
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
