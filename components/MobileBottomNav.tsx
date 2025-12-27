'use client'

import { useState, useEffect } from 'react'
import { Search, Calendar, BookOpen } from 'lucide-react'
import { getSavedLocationsCount } from '@/lib/itinerary'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

type MobileBottomNavActiveItem = 'search' | 'trip' | 'itineraries' | null

interface MobileBottomNavProps {
  onSearchClick?: () => void
  /**
   * Legacy prop name (Home page uses this to open the itinerary panel).
   * Prefer `onItinerariesClick`.
   */
  onItineraryClick?: () => void
  onTripClick?: () => void
  onItinerariesClick?: () => void
  activeItem?: MobileBottomNavActiveItem
  /** Override the badge count shown on the Trip button. If omitted, uses saved locations count. */
  tripCount?: number
}

export function MobileBottomNav({
  onSearchClick,
  onItineraryClick,
  onTripClick,
  onItinerariesClick,
  activeItem = null,
  tripCount,
}: MobileBottomNavProps) {
  const router = useRouter()
  const [savedCount, setSavedCount] = useState(0)

  const effectiveTripCount = typeof tripCount === 'number' ? tripCount : savedCount

  useEffect(() => {
    if (typeof tripCount === 'number') {
      return
    }

    setSavedCount(getSavedLocationsCount())

    const handleLocationsUpdate = () => {
      setSavedCount(getSavedLocationsCount())
    }

    window.addEventListener('locationsUpdated', handleLocationsUpdate)

    return () => {
      window.removeEventListener('locationsUpdated', handleLocationsUpdate)
    }
  }, [tripCount])

  const handleTripClick = () => {
    if (onTripClick) return onTripClick()
    router.push('/plan')
  }

  const handleItinerariesClick = () => {
    const handler = onItinerariesClick ?? onItineraryClick
    if (handler) return handler()
  }

  return (
    <div className="fixed bottom-0 left-0 w-full h-16 bg-white border-t border-violet-200/50 flex flex-row justify-around items-center z-[60] md:hidden px-2 pb-safe">
      {/* Search */}
      <button
        type="button"
        className={cn(
          "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200",
          activeItem === 'search'
            ? "bg-violet-50 text-violet-600 border border-violet-200"
            : "text-gray-500 hover:text-pink-500 border border-transparent"
        )}
        onClick={onSearchClick}
        aria-label="Search"
      >
        <Search className="w-6 h-6" strokeWidth={2} />
        <span className="text-[10px] mt-1">Search</span>
      </button>

      {/* Trip */}
      <button
        type="button"
        onClick={handleTripClick}
        className={cn(
          "relative flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200",
          activeItem === 'trip' || effectiveTripCount > 0
            ? "bg-violet-50 text-violet-600 border border-violet-200"
            : "text-violet-600 hover:bg-violet-50/50 border border-transparent hover:border-violet-200"
        )}
        aria-label="Trip"
      >
        <div className="relative">
          <Calendar className="w-6 h-6" strokeWidth={2} />
          {effectiveTripCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {effectiveTripCount > 9 ? '9+' : effectiveTripCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-1 font-medium">Trip</span>
      </button>

      {/* Itineraries */}
      <button
        type="button"
        className={cn(
          "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200",
          activeItem === 'itineraries'
            ? "bg-violet-50 text-violet-600 border border-violet-200"
            : "text-gray-500 hover:text-pink-500 border border-transparent"
        )}
        onClick={handleItinerariesClick}
        aria-label="Itineraries"
      >
        <BookOpen className="w-6 h-6" strokeWidth={2} />
        <span className="text-[10px] mt-1">Itineraries</span>
      </button>
    </div>
  )
}
