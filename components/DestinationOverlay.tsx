'use client'

import { useEffect, useRef, useState } from 'react'
import type { Destination } from '@/lib/generateDestinationInfo'
import { getCountryName } from '@/lib/countryCodeMapping'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface DestinationOverlayProps {
  destination: Destination
  mousePosition: { x: number; y: number }
}

// Helper to parse pricing values (e.g., "20-40", "25", or numbers)
function parsePricing(value: string | number): number {
  if (typeof value === 'number') return value
  const strValue = String(value)
  const match = strValue.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

export function DestinationOverlay({ destination, mousePosition }: DestinationOverlayProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current) return

    const cardWidth = 380
    const cardHeight = 400
    const padding = 16

    let x = mousePosition.x + 24
    let y = mousePosition.y + 24

    // Adjust horizontal position
    if (x + cardWidth + padding > window.innerWidth) {
      x = mousePosition.x - cardWidth - 24
    }

    // Adjust vertical position
    if (y + cardHeight + padding > window.innerHeight) {
      y = mousePosition.y - cardHeight - 24
    }

    // Ensure minimum position
    x = Math.max(padding, x)
    y = Math.max(padding, y)

    setPosition({ x, y })
  }, [mousePosition])

  // Parse accommodation range (e.g., "30-70" or "30")
  const accommodationPrice = parsePricing(destination.pricing?.accommodation || 0)
  const foodPrice = parsePricing(destination.pricing?.food || 0)
  const activitiesPrice = parsePricing(destination.pricing?.activities || 0)

  return (
    <div
      className="fixed pointer-events-none z-50 transition-all duration-200 ease-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="relative w-96" ref={cardRef}>
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-300/20 via-orange-200/10 to-transparent rounded-3xl blur-2xl"></div>

        <div className="relative bg-stone-50/95 backdrop-blur-md border border-amber-200/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-amber-400 via-orange-300 to-transparent"></div>

          <div className="p-6 space-y-5">
            <div>
              <h3 className="text-2xl font-bold text-stone-900 mb-2">{getCountryName(destination.country)}</h3>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{destination.region}</span>
              </div>
            </div>

            {destination.description?.[0] && (
              <div className="text-sm leading-relaxed text-stone-700 prose prose-sm max-w-none prose-p:my-0">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{destination.description[0]}</ReactMarkdown>
              </div>
            )}

            <div className="pt-2 border-t border-amber-200/50">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-4">Daily Breakdown</p>

              <div className="space-y-3">
                {/* Accommodation */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-amber-50/50 border border-amber-200/50 hover:border-amber-400/50 transition-all">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                    </svg>
                    <span className="text-xs font-medium text-stone-700">Accommodation</span>
                  </div>
                  <span className="text-sm font-semibold text-amber-700">
                    ${destination.pricing?.accommodation || 0}/night
                  </span>
                </div>

                {/* Food */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-orange-50/50 border border-orange-200/50 hover:border-orange-400/50 transition-all">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                    </svg>
                    <span className="text-xs font-medium text-stone-700">Food & Dining</span>
                  </div>
                  <span className="text-sm font-semibold text-orange-700">${destination.pricing?.food || 0}/day</span>
                </div>

                {/* Activities */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-50/50 border border-yellow-200/50 hover:border-yellow-400/50 transition-all">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                    </svg>
                    <span className="text-xs font-medium text-stone-700">Activities</span>
                  </div>
                  <span className="text-sm font-semibold text-yellow-700">${destination.pricing?.activities || 0}/day</span>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-amber-100/60 to-orange-100/60 border border-amber-300/50">
                  <span className="text-xs font-semibold text-stone-800">Total Daily</span>
                  <span className="text-sm font-bold text-amber-800">
                    ${accommodationPrice + foodPrice + activitiesPrice}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

