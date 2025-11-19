'use client'

import { useRef } from 'react'
import type { Destination } from '@/lib/generateDestinationInfo'
import { getCountryName } from '@/lib/countryCodeMapping'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { HiOutlineHeart, HiOutlineCalendarDays } from 'react-icons/hi2'

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

  // Parse accommodation range (e.g., "30-70" or "30")
  const accommodationPrice = parsePricing(destination.pricing?.accommodation || 0)
  const foodPrice = parsePricing(destination.pricing?.food || 0)
  const activitiesPrice = parsePricing(destination.pricing?.activities || 0)
  const totalDaily = accommodationPrice + foodPrice + activitiesPrice

  // Position near cursor with offset
  const offsetX = 16
  const offsetY = 16

  return (
    <div
      className="fixed z-50 pointer-events-auto"
      style={{
        left: `${mousePosition.x + offsetX}px`,
        top: `${mousePosition.y + offsetY}px`,
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
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors group relative"
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: Add to itinerary logic
                    console.log('Add to itinerary:', destination.region)
                  }}
                  aria-label="Add to itinerary"
                >
                  <HiOutlineCalendarDays className="w-4 h-4 text-gray-600 group-hover:text-blue-500 transition-colors" />
                  <span className="absolute -bottom-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Add to itinerary
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

