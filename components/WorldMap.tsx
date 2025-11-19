'use client'

import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker, Annotation } from 'react-simple-maps'
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
  selectedDestination?: Destination | null
  onDestinationSelect?: (destination: Destination | null) => void
  isSidebarOpen?: boolean
}

export default function WorldMap({
  loading,
  destinations = [],
  selectedDestination: externalSelectedDestination = null,
  onDestinationSelect,
  isSidebarOpen = false
}: WorldMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [hoveredCountryName, setHoveredCountryName] = useState<string | null>(null)
  const [hoveredCentroid, setHoveredCentroid] = useState<[number, number] | null>(null)
  const [hoveredDestination, setHoveredDestination] = useState<Destination | null>(null)
  const [internalSelectedDestination, setInternalSelectedDestination] = useState<Destination | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  // Use external selectedDestination if provided, otherwise use internal
  const selectedDestination = externalSelectedDestination || internalSelectedDestination
  const [geographies, setGeographies] = useState<any[]>([])
  const geographiesRef = useRef<any[]>([])
  const [position, setPosition] = useState({ coordinates: [0, 44] as [number, number], zoom: 1 })
  const [isHoveringOverlay, setIsHoveringOverlay] = useState(false)
  const overlayTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [overlayPosition, setOverlayPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Update selectedDestination when destinations array changes
  useEffect(() => {
    if (selectedDestination) {
      const updated = destinations.find(
        d => d.country === selectedDestination.country && d.region === selectedDestination.region
      )
      if (updated && (onDestinationSelect || setInternalSelectedDestination)) {
        if (onDestinationSelect) {
          onDestinationSelect(updated)
        } else {
          setInternalSelectedDestination(updated)
        }
      }
    }
  }, [destinations, selectedDestination, onDestinationSelect])

  // Open panel when external selectedDestination changes
  useEffect(() => {
    if (externalSelectedDestination) {
      setIsPanelOpen(true)
    }
  }, [externalSelectedDestination])

  // Update hoveredDestination when destinations array changes
  useEffect(() => {
    if (hoveredDestination) {
      const updated = destinations.find(
        d => d.country === hoveredDestination.country && d.region === hoveredDestination.region
      )
      if (updated) {
        setHoveredDestination(updated)
      }
    }
  }, [destinations, hoveredDestination])

  const handleCountryClick = (destination: Destination | undefined) => {
    if (destination) {
      if (onDestinationSelect) {
        onDestinationSelect(destination)
      } else {
        setInternalSelectedDestination(destination)
      }
      setIsPanelOpen(true)
    }
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    if (onDestinationSelect) {
      onDestinationSelect(null)
    } else {
      setInternalSelectedDestination(null)
    }
  }

  const handleZoomIn = () => {
    if (position.zoom < 8) {
      setPosition({ ...position, zoom: position.zoom * 1.5 })
    }
  }

  const handleZoomOut = () => {
    if (position.zoom > 1) {
      setPosition({ ...position, zoom: position.zoom / 1.5 })
    }
  }

  const handleReset = () => {
    setPosition({ coordinates: [0, 44], zoom: 1 })
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

  // Calculate marker positions for destinations
  const destinationMarkers = useMemo(() => {
    if (!geographies || geographies.length === 0) return []

    return destinations
      .filter(dest => dest.country)
      .map(dest => {
        const countryNames = codeToCountry.get(dest.country) || []
        const geo = geographies.find((g: any) => countryNames.includes(g.properties.name))

        if (!geo) return null

        try {
          const centroid = CENTROID_OVERRIDES[geo.properties.name] || pathGenerator.centroid(geo)
          return {
            destination: dest,
            coordinates: projection.invert ? projection.invert(centroid) as [number, number] : [0, 0] as [number, number],
          }
        } catch (e) {
          return null
        }
      })
      .filter((marker): marker is { destination: Destination; coordinates: [number, number] } => marker !== null)
  }, [destinations, geographies, pathGenerator, projection])

  return (
    <div
      className="fixed inset-0 w-screen h-screen grid place-items-center overflow-hidden z-0"
    >
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [0, 44],
          scale: 155,
        }}
        width={1000}
        height={640}
        className="w-screen h-screen"
        style={{ width: "100vw", height: "100vh" }}
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
        <ZoomableGroup
          center={position.coordinates}
          zoom={position.zoom}
          minZoom={1}
          maxZoom={8}
          onMoveEnd={(newPosition) => setPosition(newPosition)}
        >
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
                        try {
                          const centroid = CENTROID_OVERRIDES[geo.properties.name] || pathGenerator.centroid(geo)
                          setHoveredCentroid(centroid)
                        } catch (e) {
                          setHoveredCentroid(null)
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredCountry(null)
                        setHoveredCountryName(null)
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

          {/* Destination markers with labels */}
          {destinationMarkers.map((marker, index) => {
            const isSelected = selectedDestination?.region === marker.destination.region &&
              selectedDestination?.country === marker.destination.country
            const hasDetails = marker.destination.description && marker.destination.pricing

            return (
              <g key={`marker-${marker.destination.country}-${marker.destination.region}-${index}`}>
                {/* Simple dot marker */}
                <Marker coordinates={marker.coordinates}>
                  <g
                    onClick={() => handleCountryClick(marker.destination)}
                    onMouseEnter={(e) => {
                      if (overlayTimeoutRef.current) {
                        clearTimeout(overlayTimeoutRef.current)
                      }
                      const mouseEvent = e as any
                      setOverlayPosition({
                        x: mouseEvent.clientX,
                        y: mouseEvent.clientY
                      })
                      setHoveredDestination(marker.destination)
                    }}
                    onMouseLeave={() => {
                      // Delay hiding to allow mouse to move to overlay
                      overlayTimeoutRef.current = setTimeout(() => {
                        if (!isHoveringOverlay) {
                          setHoveredDestination(null)
                        }
                      }, 100)
                    }}
                    style={{ cursor: 'pointer' }}
                    className="transition-all hover:scale-125"
                  >
                    {/* Simple circle dot */}
                    <circle
                      cx="0"
                      cy="0"
                      r="5"
                      fill={isSelected ? '#6366f1' : hasDetails ? '#8b5cf6' : '#a78bfa'}
                      stroke="white"
                      strokeWidth="2"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}
                    />
                  </g>
                </Marker>
              </g>
            )
          })}

          {/* Show label only for hovered country (if not a destination) */}
          {hoveredCentroid && hoveredCountryName && !isDestinationCountry(hoveredCountryName) && (
            <CountryLabel
              centroid={hoveredCentroid}
              countryName={hoveredCountryName}
              direction="right-top"
            />
          )}
        </ZoomableGroup>
      </ComposableMap>
      <SidePanel
        destination={selectedDestination}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        isSidebarOpen={isSidebarOpen}
      />
      {/* Show destination overlay on hover (only from pins) */}
      {(hoveredDestination || isHoveringOverlay) && hoveredDestination && (
        <DestinationOverlay
          destination={hoveredDestination}
          mousePosition={overlayPosition}
          onMouseEnter={() => {
            if (overlayTimeoutRef.current) {
              clearTimeout(overlayTimeoutRef.current)
            }
            setIsHoveringOverlay(true)
          }}
          onMouseLeave={() => {
            setIsHoveringOverlay(false)
            setHoveredDestination(null)
          }}
        />
      )}
      {/* Zoom control buttons */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
        <button
          onClick={handleZoomIn}
          disabled={position.zoom >= 8}
          className="w-8 h-8 bg-white/90 hover:bg-white text-gray-800 rounded-lg shadow-lg flex items-center justify-center font-bold text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          disabled={position.zoom <= 1}
          className="w-8 h-8 bg-white/90 hover:bg-white text-gray-800 rounded-lg shadow-lg flex items-center justify-center font-bold text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={handleReset}
          className="w-8 h-8 bg-white/90 hover:bg-white text-gray-800 rounded-lg shadow-lg flex items-center justify-center font-bold text-base transition-all hover:scale-105"
          title="Reset View"
        >
          ⟲
        </button>
      </div>
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
