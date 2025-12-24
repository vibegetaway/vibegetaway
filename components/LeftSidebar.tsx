'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Search, Calendar } from 'lucide-react'
import { getSavedLocationsCount } from '@/lib/itinerary'
import { ProfileMenu } from './ProfileMenu'

interface LeftSidebarProps {
  onSearchClick?: () => void
  onItineraryClick?: () => void
}

export function LeftSidebar({ onSearchClick, onItineraryClick, onSearchHistoryClick }: LeftSidebarProps & { onSearchHistoryClick?: () => void }) {
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    setSavedCount(getSavedLocationsCount())

    const handleLocationsUpdate = () => {
      setSavedCount(getSavedLocationsCount())
    }

    window.addEventListener('locationsUpdated', handleLocationsUpdate)

    return () => {
      window.removeEventListener('locationsUpdated', handleLocationsUpdate)
    }
  }, [])

  return (
    <div className="hidden md:flex fixed left-0 top-0 w-16 h-screen bg-violet-50 border-r border-violet-200/50 flex-col items-center py-4 gap-6 z-[60]">
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
        {savedCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {savedCount > 9 ? '9+' : savedCount}
          </span>
        )}
      </button>

      <div className="flex-grow" />

      {/* User authentication at bottom */}
      <div className="mt-auto">
        <ProfileMenu variant="desktop" onSearchHistoryClick={onSearchHistoryClick} />
      </div>
    </div>
  )
}

