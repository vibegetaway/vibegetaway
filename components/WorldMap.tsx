'use client'

import { useState, useRef } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import type { Destination } from '@/lib/generateDestinationInfo'
import { DestinationOverlay } from './DestinationOverlay'
import { SidePanel } from './SidePanel'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

interface WorldMapProps {
  destinations?: Destination[]
}

export default function WorldMap({ destinations = [] }: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
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
      ref={containerRef} 
      className="w-full h-full relative"
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
        </defs>
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: any[] }) =>
            geographies
              .filter((geo: any) => geo.properties.name !== 'Antarctica')
              .map((geo: any) => {
                const isHovered = hoveredCountry === geo.rsmKey
                const isHighlighted = destinations.some(d => d.country === geo.properties.name)
                const matchingDest = destinations.find(d => d.country === geo.properties.name)
                
                // Determine fill pattern
                let fillPattern = "url(#dot-pattern)"
                if (isHighlighted) {
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

