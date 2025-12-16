'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus, Check } from 'lucide-react'
import type { Itinerary } from '@/lib/itinerary'

interface ItinerarySelectorProps {
  itineraries: Itinerary[]
  activeItinerary: Itinerary | null
  onSelect: (itinerary: Itinerary) => void
  onCreateNew: () => void
}

export function ItinerarySelector({
  itineraries,
  activeItinerary,
  onSelect,
  onCreateNew,
}: ItinerarySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (itineraries.length === 0 && !activeItinerary) {
    return (
      <button
        onClick={onCreateNew}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Create Itinerary
      </button>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-violet-200 rounded-lg hover:border-violet-300 transition-colors min-w-[180px]"
      >
        <span className="flex-1 text-left text-violet-900 font-medium truncate">
          {activeItinerary?.name || 'Select itinerary'}
        </span>
        <ChevronDown className={`w-4 h-4 text-violet-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-violet-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {itineraries.map((itinerary) => (
              <button
                key={itinerary.id}
                onClick={() => {
                  onSelect(itinerary)
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-violet-50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-violet-900 truncate">{itinerary.name}</p>
                  <p className="text-xs text-violet-500">
                    {itinerary.destinations.length} destination{itinerary.destinations.length !== 1 ? 's' : ''}
                    {itinerary.tripDuration && ` • ${itinerary.tripDuration} days`}
                  </p>
                </div>
                {activeItinerary?.id === itinerary.id && (
                  <Check className="w-4 h-4 text-pink-500" />
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-violet-200">
            <button
              onClick={() => {
                onCreateNew()
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-2 px-4 py-3 hover:bg-violet-50 transition-colors text-pink-600 font-medium"
            >
              <Plus className="w-4 h-4" />
              New Itinerary
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
