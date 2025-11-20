'use client'

import { useRef, useState, useEffect } from 'react'
import type { Destination } from '@/lib/generateDestinationInfo'
import { getCountryName } from '@/lib/countryCodeMapping'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { HiOutlineHeart, HiOutlineCalendarDays, HiCheckCircle } from 'react-icons/hi2'
import { addToItinerary, isInItinerary } from '@/lib/itinerary'

interface DestinationOverlayProps {
  destination: Destination
  mousePosition: { x: number; y: number }
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

// Helper to parse pricing values (e.g., "20-40", "25", or numbers)
function parsePricing(value: string | number): number {
  if (typeof value === 'number') return value
  const strValue = String(value)
  const match = strValue.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

export function DestinationOverlay({ destination, mousePosition, onMouseEnter, onMouseLeave }: DestinationOverlayProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isInItineraryState, setIsInItineraryState] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [position, setPosition] = useState({ left: 0, top: 0 })

  // Check if destination is in itinerary
  useEffect(() => {
    setIsInItineraryState(isInItinerary(destination))

    // Listen for itinerary updates
    const handleItineraryUpdate = () => {
      setIsInItineraryState(isInItinerary(destination))
    }

    window.addEventListener('itineraryUpdated' as any, handleItineraryUpdate)

    return () => {
      window.removeEventListener('itineraryUpdated' as any, handleItineraryUpdate)
    }
  }, [destination])

  // Calculate position with edge detection
  useEffect(() => {
    if (!cardRef.current) return

    const cardWidth = 320 // w-80 = 320px
    const cardHeight = cardRef.current.offsetHeight || 250 // estimated height
    const offsetX = 8 // Closer to cursor
    const offsetY = 8 // Closer to cursor
    const margin = 10 // Margin from screen edges

    let left = mousePosition.x + offsetX
    let top = mousePosition.y + offsetY

    // Check right edge
    if (left + cardWidth > window.innerWidth - margin) {
      left = mousePosition.x - cardWidth - offsetX
    }

    // Check bottom edge
    if (top + cardHeight > window.innerHeight - margin) {
      top = mousePosition.y - cardHeight - offsetY
    }

    // Check left edge
    if (left < margin) {
      left = margin
    }

    // Check top edge
    if (top < margin) {
      top = margin
    }

    setPosition({ left, top })
  }, [mousePosition])

  // Parse accommodation range (e.g., "30-70" or "30")
  const accommodationPrice = parsePricing(destination.pricing?.accommodation || 0)
  const foodPrice = parsePricing(destination.pricing?.food || 0)
  const activitiesPrice = parsePricing(destination.pricing?.activities || 0)
  const totalDaily = accommodationPrice + foodPrice + activitiesPrice

  const handleAddToItinerary = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isInItineraryState) {
      addToItinerary(destination)
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2000)
    }
  }

  return (
    <div
      className="fixed z-[1001] pointer-events-auto"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative w-80" ref={cardRef}>
        {/* Simple card like Google Maps */}
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900">{destination.region}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{getCountryName(destination.country)}</p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <button
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors group relative"
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: Add to favorites logic
                    console.log('Add to favorites:', destination.region)
                  }}
                  aria-label="Add to favorites"
                >
                  <HiOutlineHeart className="w-4 h-4 text-gray-600 group-hover:text-red-500 transition-colors" />
                  <span className="absolute -bottom-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Add to favorites
                  </span>
                </button>

                <button
                  className={`p-1.5 rounded-lg transition-colors group relative ${isInItineraryState
                      ? 'bg-green-50'
                      : 'hover:bg-gray-100'
                    }`}
                  onClick={handleAddToItinerary}
                  aria-label={isInItineraryState ? 'In itinerary' : 'Add to itinerary'}
                  disabled={isInItineraryState}
                >
                  {isInItineraryState ? (
                    <HiCheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <HiOutlineCalendarDays className={`w-4 h-4 transition-colors ${justAdded ? 'text-green-500' : 'text-gray-600 group-hover:text-blue-500'
                      }`} />
                  )}
                  <span className="absolute -bottom-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {isInItineraryState ? 'In itinerary' : 'Add to itinerary'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 space-y-2">
            {/* Description - full first paragraph */}
            {destination.description?.[0] ? (
              <div className="text-xs text-gray-600 leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{destination.description[0]}</ReactMarkdown>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="h-3 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded animate-pulse w-4/5"></div>
              </div>
            )}

            {/* Pricing - simple single line */}
            {destination.pricing ? (
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Estimated daily cost</span>
                  <span className="text-sm font-semibold text-orange-600">${totalDaily}</span>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-100">
                <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

