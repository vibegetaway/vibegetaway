'use client'

import { useState, useRef } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import type { Destination } from '@/lib/generateDestinationInfo'
import { DestinationOverlay } from './DestinationOverlay'
import { SidePanel } from './SidePanel'
import { codeToCountry } from '@/lib/countryCodeMapping'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

interface WorldMapProps {
  loading: boolean
  destinations?: Destination[]
}

export default function WorldMap({ loading, destinations = [] }: WorldMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [hoveredCountryName, setHoveredCountryName] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [hoveredDestination, setHoveredDestination] = useState<Destination | null>(null)
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const handleCountryClick = (destination: Destination | undefined) => {
    if (destination) {
      setSelectedDestination(destination)
      setIsPanelOpen(true)
    }
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    setSelectedDestination(null)
  }

  return (
    <div 
      className="min-h-[80dvh] grid place-items-center relative"
      onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
    >
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [0, 44],
          scale: 155,
        }}
        width={1000}
        height={640}
        className="block mx-auto h-auto w-full max-w-[calc(80dvh*(1000/640))]"
        style={{ width: "100%", height: "auto" }}
      >
        <defs>
          <pattern
            id="dot-pattern"
            x="0"
            y="0"
            width="3"
            height="3"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="#999" opacity="0.5" />
          </pattern>
          <pattern
            id="dot-pattern-blue"
            x="0"
            y="0"
            width="3"
            height="3"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="#3b82f6" opacity="0.7" />
          </pattern>
          <pattern
            id="dot-pattern-green"
            x="0"
            y="0"
            width="3"
            height="3"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="#10b981" opacity="0.7" />
          </pattern>
          <pattern
            id="dot-pattern-loading"
            x="0"
            y="0"
            width="3"
            height="3"
            patternUnits="userSpaceOnUse"
          >
            <circle className="loading-dot" cx="1" cy="1" r="1" />
          </pattern>
        </defs>
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: any[] }) =>
            geographies
              .filter((geo: any) => geo.properties.name !== 'Antarctica')
              .map((geo: any) => {
                const isHovered = hoveredCountry === geo.rsmKey
                
                // Check if country is highlighted using both ISO codes and country names
                const isHighlightedByCode = destinations
                  .filter(d => d.country) // Only check destinations with country codes
                  .map((d) => codeToCountry.get(d.country) || [])
                  .flat()
                  .includes(geo.properties.name)
                
                const matchingDest = destinations.find(d => {
                  // Match by country name directly (for full destination objects)
                  if (d.region && d.description) {
                    const codeNames = codeToCountry.get(d.country) || []
                    return codeNames.includes(geo.properties.name)
                  }
                  return false
                })
                
                const isHighlighted = isHighlightedByCode
                
                // Determine fill pattern
                let fillPattern = "url(#dot-pattern)"
                if (loading) {
                  fillPattern = "url(#dot-pattern-loading)"
                } else if (isHighlighted) {
                  fillPattern = "url(#dot-pattern-blue)"
                } else if (isHovered) {
                  fillPattern = "url(#dot-pattern-green)"
                }
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillPattern}
                    onMouseEnter={() => {
                      setHoveredCountry(geo.rsmKey)
                      setHoveredCountryName(geo.properties.name)
                      if (matchingDest) {
                        setHoveredDestination(matchingDest)
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredCountry(null)
                      setHoveredCountryName(null)
                      setHoveredDestination(null)
                    }}
                    onClick={() => handleCountryClick(matchingDest)}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", cursor: matchingDest ? "pointer" : "default" },
                      pressed: { outline: "none" },
                    }}
                  />
                )
              })
          }
        </Geographies>
      </ComposableMap>
      {hoveredDestination && (
        <DestinationOverlay 
          destination={hoveredDestination} 
          mousePosition={mousePosition} 
        />
      )}
      {hoveredCountryName && !hoveredDestination && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: `${mousePosition.x + 16}px`,
            top: `${mousePosition.y + 16}px`,
          }}
        >
          <div className="bg-stone-50/95 backdrop-blur-md border border-amber-200/50 rounded-lg shadow-lg px-3 py-2">
            <p className="text-sm font-medium text-stone-900">{hoveredCountryName}</p>
          </div>
        </div>
      )}
      <SidePanel 
        destination={selectedDestination}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
      />
    </div>
  )
}

