'use client'

import { useState, useEffect } from 'react'
import { Destination } from '@/lib/generateDestinationInfo'
import { getCountryName } from '@/lib/countryCodeMapping'
import { MapPin, X, Trash2 } from 'lucide-react'
import { getFavorites, removeFromFavorites, clearFavorites, formatAddedDate, type FavoriteItem } from '@/lib/favorites'

interface FavoritesPanelProps {
  isOpen: boolean
  onClose: () => void
  onDestinationClick: (destination: Destination) => void
  selectedDestination: Destination | null
}

export function FavoritesPanel({
  isOpen,
  onClose,
  onDestinationClick,
  selectedDestination,
}: FavoritesPanelProps) {
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([])

  // Load favorites from local storage
  useEffect(() => {
    setFavoriteItems(getFavorites())
    
    // Listen for favorites updates from other components
    const handleFavoritesUpdate = (event: CustomEvent) => {
      setFavoriteItems(event.detail)
    }
    
    window.addEventListener('favoritesUpdated' as any, handleFavoritesUpdate)
    
    return () => {
      window.removeEventListener('favoritesUpdated' as any, handleFavoritesUpdate)
    }
  }, [])

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeFromFavorites(id)
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all your favorites?')) {
      clearFavorites()
    }
  }

  // Helper to parse pricing values
  function parsePricing(value: string | number): number {
    if (typeof value === 'number') return value
    const strValue = String(value)
    const match = strValue.match(/(\d+)/)
    return match ? parseInt(match[1], 10) : 0
  }

  return (
    <div
      className={`fixed left-20 top-0 h-screen w-full max-w-md bg-stone-50 border-r border-amber-200/50 shadow-2xl z-40 transition-transform duration-300 ease-in-out overflow-y-auto pointer-events-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold text-stone-900 mb-2">My Favorites</h2>
            <p className="text-stone-600">
              {favoriteItems.length === 0
                ? 'No favorites saved yet'
                : `${favoriteItems.length} ${favoriteItems.length === 1 ? 'destination' : 'destinations'}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-stone-600" />
          </button>
        </div>

        {/* Clear all button */}
        {favoriteItems.length > 0 && (
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
        {favoriteItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-stone-900 mb-2">No favorites yet</h3>
            <p className="text-stone-600 max-w-xs">
              Start adding destinations to your favorites by clicking the heart icon on destination cards
            </p>
          </div>
        ) : (
          /* Favorites list */
          <div className="space-y-3">
            {favoriteItems.map((item) => {
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

              return (
                <div
                  key={item.id}
                  className={`relative group bg-white border border-amber-200/50 hover:border-amber-300 rounded-lg transition-all ${
                    isSelected ? 'bg-amber-50 border-amber-400' : ''
                  }`}
                >
                  <button
                    onClick={() => onDestinationClick(destination)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start gap-3">
                      {/* Pin icon */}
                      <div className="flex-shrink-0 mt-1">
                        <MapPin
                          className={`w-5 h-5 ${
                            isSelected ? 'text-amber-700' : 'text-red-500'
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-stone-900 mb-1">{destination.region}</h3>
                        <p className="text-sm text-stone-600 mb-2">
                          {getCountryName(destination.country)}
                        </p>

                        {/* Description snippet */}
                        {destination.description?.[0] && (
                          <p className="text-sm text-stone-700 mt-1 line-clamp-2">
                            {destination.description[0]}
                          </p>
                        )}

                        {/* Pricing and added date */}
                        <div className="flex items-center justify-between mt-2">
                          {dailyCost > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                              ${dailyCost}/day
                            </span>
                          )}
                          <span className="text-xs text-stone-500">
                            Added {formatAddedDate(item.addedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Remove button */}
                  <button
                    onClick={(e) => handleRemove(item.id, e)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                    aria-label="Remove from favorites"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

