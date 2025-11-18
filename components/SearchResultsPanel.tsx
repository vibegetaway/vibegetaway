'use client'

import { Destination } from '@/lib/generateDestinationInfo'
import { MapPin, X, Loader2 } from 'lucide-react'

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

              return (
                <button
                  key={`${destination.country}-${destination.region}-${index}`}
                  onClick={() => onDestinationClick(destination)}
                  className={`w-full p-4 bg-white hover:bg-amber-50/50 border border-amber-200/50 hover:border-amber-300 rounded-lg transition-all text-left ${
                    isSelected ? 'bg-amber-50 border-amber-400' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Pin icon */}
                    <div className="flex-shrink-0 mt-1">
                      <MapPin className={`w-5 h-5 ${isSelected ? 'text-amber-700' : hasDetails ? 'text-orange-500' : 'text-orange-300'}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
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
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

