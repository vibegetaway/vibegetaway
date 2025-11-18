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
}

export default function WorldMap({ 
  loading, 
  destinations = [], 
  selectedDestination: externalSelectedDestination = null,
  onDestinationSelect
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
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [position, setPosition] = useState({ coordinates: [0, 44] as [number, number], zoom: 1 })

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
        
        {/* Destination markers with labels */}
        {destinationMarkers.map((marker, index) => {
          const isSelected = selectedDestination?.region === marker.destination.region && 
                           selectedDestination?.country === marker.destination.country
          const hasDetails = marker.destination.description && marker.destination.pricing
          
          return (
            <g key={`marker-${marker.destination.country}-${marker.destination.region}-${index}`}>
              {/* Pin marker */}
              <Marker coordinates={marker.coordinates}>
                <g
                  onClick={() => handleCountryClick(marker.destination)}
                  style={{ cursor: 'pointer' }}
                  className="transition-all hover:scale-110"
                >
                  {/* Shadow */}
                  <ellipse
                    cx="0"
                    cy="8"
                    rx="3"
                    ry="1.5"
                    fill="rgba(0,0,0,0.2)"
                    opacity="0.5"
                  />
                  {/* Main circle */}
                  <circle
                    cx="0"
                    cy="0"
                    r="6"
                    fill={isSelected ? '#ea580c' : hasDetails ? '#f97316' : '#fb923c'}
                    stroke="white"
                    strokeWidth="2"
                  />
                  {/* Inner dot */}
                  <circle
                    cx="0"
                    cy="0"
                    r="2.5"
                    fill="white"
                  />
                  {/* Bottom point */}
                  <path
                    d="M 0,6 L 2,9 L -2,9 Z"
                    fill={isSelected ? '#ea580c' : hasDetails ? '#f97316' : '#fb923c'}
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </g>
              </Marker>
              
              {/* Label with background */}
              <Annotation
                subject={marker.coordinates}
                dx={0}
                dy={-18}
                connectorProps={{
                  stroke: 'transparent',
                }}
              >
                <foreignObject
                  x="-50"
                  y="-12"
                  width="100"
                  height="24"
                  style={{ overflow: 'visible' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  >
                    <div
                      style={{
                        padding: '4px 8px',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                        border: '1px solid rgba(0,0,0,0.1)',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontSize: position.zoom > 2 ? '11px' : '9px',
                        fontWeight: '600',
                        color: '#292524',
                        whiteSpace: 'nowrap',
                        maxWidth: '120px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {marker.destination.region}
                    </div>
                  </div>
                </foreignObject>
              </Annotation>
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
      />
      {/* Show destination overlay on hover */}
      {hoveredDestination && (
        <DestinationOverlay
          destination={hoveredDestination}
          mousePosition={mousePosition}
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
