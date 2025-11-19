'use client'

import { useState, useEffect } from 'react'
import { Menu, Search, Clock, Heart, Settings, Calendar } from 'lucide-react'
import { getItineraryCount } from '@/lib/itinerary'
import { getFavoritesCount } from '@/lib/favorites'

interface LeftSidebarProps {
  onMenuClick?: () => void
  onRecentClick?: () => void
  onSearchClick?: () => void
  onItineraryClick?: () => void
  onFavoritesClick?: () => void
}

export function LeftSidebar({ onMenuClick, onRecentClick, onSearchClick, onItineraryClick, onFavoritesClick }: LeftSidebarProps) {
  const [itineraryCount, setItineraryCount] = useState(0)
  const [favoritesCount, setFavoritesCount] = useState(0)

  useEffect(() => {
    // Initial load
    setItineraryCount(getItineraryCount())
    setFavoritesCount(getFavoritesCount())
    
    // Listen for updates
    const handleItineraryUpdate = (event: CustomEvent) => {
      setItineraryCount(event.detail.length)
    }
    
    const handleFavoritesUpdate = (event: CustomEvent) => {
      setFavoritesCount(event.detail.length)
    }
    
    window.addEventListener('itineraryUpdated' as any, handleItineraryUpdate)
    window.addEventListener('favoritesUpdated' as any, handleFavoritesUpdate)
    
    return () => {
      window.removeEventListener('itineraryUpdated' as any, handleItineraryUpdate)
      window.removeEventListener('favoritesUpdated' as any, handleFavoritesUpdate)
    }
  }, [])

  return (
    <div className="fixed left-0 top-0 w-20 h-screen bg-stone-50 border-r border-amber-200/50 flex flex-col items-center py-4 gap-6 z-[60]">
      {/* Menu icon */}
      <button 
        type="button"
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer" 
        onClick={onMenuClick}
        aria-label="Menu"
      >
        <Menu className="w-5 h-5 text-amber-700" strokeWidth={2} />
      </button>
      
      {/* Search icon */}
      <button 
        type="button"
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer"
        onClick={onSearchClick}
        aria-label="Search Results"
      >
        <Search className="w-5 h-5 text-amber-700" strokeWidth={2} />
      </button>
      
      {/* Recent icon */}
      <button 
        type="button"
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer"
        onClick={onRecentClick}
        aria-label="Recent"
      >
        <Clock className="w-5 h-5 text-amber-700" strokeWidth={2} />
      </button>
      
      {/* Itinerary icon with counter badge */}
      <button 
        type="button"
        className="relative w-12 h-12 flex items-center justify-center rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer"
        onClick={onItineraryClick}
        aria-label="My Itinerary"
      >
        <Calendar className="w-5 h-5 text-amber-700" strokeWidth={2} />
        {itineraryCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {itineraryCount > 9 ? '9+' : itineraryCount}
          </span>
        )}
      </button>
      
      {/* Favorites icon with counter badge */}
      <button 
        type="button"
        className="relative w-12 h-12 flex items-center justify-center rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer"
        onClick={onFavoritesClick}
        aria-label="My Favorites"
      >
        <Heart className="w-5 h-5 text-amber-700" strokeWidth={2} />
        {favoritesCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {favoritesCount > 9 ? '9+' : favoritesCount}
          </span>
        )}
      </button>
      
      {/* Flex spacer */}
      <div className="flex-1" />
      
      {/* Settings icon */}
      <button 
        type="button"
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer"
        aria-label="Settings"
      >
        <Settings className="w-5 h-5 text-amber-700" strokeWidth={2} />
      </button>
    </div>
  )
}

