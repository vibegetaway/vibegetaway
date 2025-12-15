'use client'

import { useState, useEffect } from 'react'
import { Destination } from '@/lib/generateDestinationInfo'
import { getCountryName } from '@/lib/countryCodeMapping'
import { MapPin, X, Trash2, Heart } from 'lucide-react'
import { getFavorites, removeFromFavorites, clearFavorites, formatAddedDate, type FavoriteItem } from '@/lib/favorites'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
      className={`fixed left-20 top-0 h-screen w-full max-w-md bg-white/95 backdrop-blur-md border-r border-violet-200 shadow-2xl z-40 transition-transform duration-300 ease-in-out overflow-y-auto pointer-events-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
    >
      {/* Spacer for text input */}


      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-violet-900 mb-1 tracking-tight">My Favorites</h2>
            <p className="text-violet-500 text-xs font-medium">
              {favoriteItems.length === 0
                ? 'No favorites saved yet'
                : `${favoriteItems.length} ${favoriteItems.length === 1 ? 'destination' : 'destinations'} saved`}
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-violet-900 mb-2">No favorites yet</h3>
            <p className="text-violet-500 text-sm max-w-xs">
              Start adding destinations to your favorites by clicking the heart icon on destination cards
            </p>
          </div>
        ) : (
          /* Favorites list */
          <div className="space-y-6">
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
                    className="cursor-pointer p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-violet-900 leading-tight">{destination.region}</h3>
                        <div className="flex items-center gap-1 text-violet-500 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs font-medium tracking-wide uppercase">
                            {getCountryName(destination.country)}
                          </span>
                        </div>
                      </div>

                      {/* Added Date Badge */}
                      <span className="text-[10px] text-violet-400 font-medium bg-violet-50 px-1.5 py-0.5 rounded-md border border-violet-100">
                        Added {formatAddedDate(item.addedAt)}
                      </span>
                    </div>

                    {/* Description with Markdown */}
                    {descriptionText && (
                      <div className="prose prose-xs prose-violet max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-strong:text-pink-600 prose-li:marker:text-pink-400 mb-3">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {descriptionText}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Pricing Info */}
                    {dailyCost > 0 && (
                      <div className="flex items-center pt-2 border-t border-violet-100">
                        <span className="text-xs font-semibold text-violet-700">
                          Est. <span className="text-pink-500">${dailyCost}</span> / day
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={(e) => handleRemove(item.id, e)}
                    className="absolute top-3 right-3 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-rose-50 text-violet-400 hover:text-rose-500 transition-all"
                    aria-label="Remove from favorites"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
