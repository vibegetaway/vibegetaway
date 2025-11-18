'use client'

import { useState, useRef, useMemo, useCallback } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { geoPath, geoMercator } from 'd3-geo'
import type { Destination } from '@/lib/generateDestinationInfo'
import { codeToCountry } from '@/lib/countryCodeMapping'
import { SidePanel } from './SidePanel'
import { CountryLabel } from './CountryLabel'
import { DestinationOverlay } from './DestinationOverlay'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const CENTROID_OVERRIDES: Record<string, [number, number]> = {
  'United States of America': [230, 335], // Mainland USA (approximate center)
  Canada: [230, 280], // Mainland Canada (southern-central region)
  Norway: [522, 246],
}

interface WorldMapProps {
  loading: boolean
  destinations?: Destination[]
}

export default function WorldMap({ loading, destinations = [] }: WorldMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [hoveredCountryName, setHoveredCountryName] = useState<string | null>(null)
  const [hoveredCentroid, setHoveredCentroid] = useState<[number, number] | null>(null)
  const [hoveredDestination, setHoveredDestination] = useState<Destination | null>(null)
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [geographies, setGeographies] = useState<any[]>([])
  const geographiesRef = useRef<any[]>([])
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

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
  const projection = geoMercator()
    .center([0, 44])
    .scale(155)
    .translate([1000 / 2, 640 / 2])
  const pathGenerator = geoPath().projection(projection)

  // Helper to check if a country is a destination
  const isDestinationCountry = useCallback((countryName: string) => {
    return destinations.some(dest => {
      if (!dest.country) return false
      const countryNames = codeToCountry.get(dest.country) || []
      return countryNames.includes(countryName)
    })
  }, [destinations])

  return (
    <div 
      className="min-h-[40dvh] grid place-items-center relative"
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
        className="block mx-auto h-auto w-full max-w-[calc((100dvh-220px)*(1000/640))]"
        style={{ width: "100%", height: "auto" }}
      >
        <defs>
          <pattern id="dot-pattern" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#999" opacity="0.5" />
          </pattern>
          <pattern id="dot-pattern-blue" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#3b82f6" opacity="0.7" />
          </pattern>
          <pattern id="dot-pattern-green" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#10b981" opacity="0.7" />
          </pattern>
          <pattern id="dot-pattern-loading" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
            <circle className="loading-dot" cx="1" cy="1" r="1" />
          </pattern>
        </defs>
        <Geographies geography={geoUrl}>
          {({ geographies: geoData }: { geographies: any[] }) => {
            // Store geographies for destination label calculation
            const filteredGeos = geoData.filter((geo: any) => geo.properties.name !== 'Antarctica')
            if (filteredGeos.length > 0 && geographiesRef.current.length === 0) {
              geographiesRef.current = filteredGeos
              setGeographies(filteredGeos)
            }

            return filteredGeos
              .map((geo: any) => {
                const isHovered = hoveredCountry === geo.rsmKey

                // Check if country is highlighted using both ISO codes and country names
                const isHighlightedByCode = destinations
                  .filter(d => d.country) // Only check destinations with country codes
                  .map((d) => codeToCountry.get(d.country) || [])
                  .flat()
                  .includes(geo.properties.name)

                const matchingDest = destinations.find(d => {
                  // Match by country code to ensure consistency with highlighting
                  if (d.country) {
                    const codeNames = codeToCountry.get(d.country) || []
                    return codeNames.includes(geo.properties.name)
                  }
                  return false
                })

                const isHighlighted = isHighlightedByCode
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
                    onMouseEnter={(event) => {
                      setHoveredCountry(geo.rsmKey)
                      setHoveredCountryName(geo.properties.name)
                      if (matchingDest) {
                        setHoveredDestination(matchingDest)
                      }
                      try {
                        const centroid = CENTROID_OVERRIDES[geo.properties.name] || pathGenerator.centroid(geo)
                        setHoveredCentroid(centroid)
                      } catch (e) {
                        setHoveredCentroid(null)
                      }
                      // Track mouse position for overlay
                      setMousePosition({ x: event.clientX, y: event.clientY })
                    }}
                    onMouseLeave={() => {
                      setHoveredCountry(null)
                      setHoveredCountryName(null)
                      setHoveredDestination(null)
                      setHoveredCentroid(null)
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
          }
        </Geographies>
        {/* Show label only for hovered country (if not a destination) */}
        {hoveredCentroid && hoveredCountryName && !isDestinationCountry(hoveredCountryName) && (
          <CountryLabel
            centroid={hoveredCentroid}
            countryName={hoveredCountryName}
            direction="right-top"
          />
        )}
      </ComposableMap>
      <SidePanel
        destination={selectedDestination}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
      />
      {/* Show destination overlay on hover */}
      {hoveredDestination && (
        <DestinationOverlay
          destination={hoveredDestination}
          mousePosition={mousePosition}
        />
      )}
      <style jsx>{`
        @keyframes drawLine {
          from {
            stroke-dashoffset: 56.57;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
