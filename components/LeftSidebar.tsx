'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Search, Clock, Calendar } from 'lucide-react'
import { getItineraryCount } from '@/lib/itinerary'

interface LeftSidebarProps {
  onRecentClick?: () => void
  onSearchClick?: () => void
  onItineraryClick?: () => void
}

export function LeftSidebar({ onRecentClick, onSearchClick, onItineraryClick }: LeftSidebarProps) {
  const [itineraryCount, setItineraryCount] = useState(0)

  useEffect(() => {
    // Initial load
    setItineraryCount(getItineraryCount())

    const handleItineraryUpdate = (event: CustomEvent) => {
      setItineraryCount(event.detail.length)
    }

    window.addEventListener('itineraryUpdated' as any, handleItineraryUpdate)

    return () => {
      window.removeEventListener('itineraryUpdated' as any, handleItineraryUpdate)
    }
  }, [])

  return (
    <div className="fixed left-0 top-0 w-16 h-screen bg-violet-50 border-r border-violet-200/50 flex flex-col items-center py-4 gap-6 z-[60]">
      <div className="mb-2">
        <Image
          src="/assets/icon.png"
          alt="VibeGetaway"
          width={40}
          height={40}
          className="rounded-lg"
        />
      </div>

      {/* Search icon */}
      <button
        type="button"
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-pink-100/60 transition-colors cursor-pointer"
        onClick={onSearchClick}
        aria-label="Search Results"
      >
        <Search className="w-5 h-5 text-pink-500" strokeWidth={2} />
      </button>

      {/* Itinerary icon with counter badge */}
      <button
        type="button"
        className="relative w-12 h-12 flex items-center justify-center rounded-lg hover:bg-pink-100/60 transition-colors cursor-pointer"
        onClick={onItineraryClick}
        aria-label="Trip Plan"
      >
        <Calendar className="w-5 h-5 text-pink-500" strokeWidth={2} />
        {itineraryCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {itineraryCount > 9 ? '9+' : itineraryCount}
          </span>
        )}
      </button>

      {/* Recent icon */}
      <button
        type="button"
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-pink-100/60 transition-colors cursor-pointer"
        onClick={onRecentClick}
        aria-label="Recent"
      >
        <Clock className="w-5 h-5 text-pink-500" strokeWidth={2} />
      </button>
    </div>
  )
}

