'use client'

import { useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { geoPath, geoMercator } from 'd3-geo'
import type { Destination } from '@/lib/generateDestinationInfo'
import { codeToCountry } from '@/lib/countryCodeMapping'
import { SidePanel } from './SidePanel'

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

  return (
    <div className="min-h-[40dvh] grid place-items-center relative">
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
                    onMouseEnter={() => {
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
        </Geographies>
        {hoveredCentroid && hoveredCountryName && (
          <g className="pointer-events-none">
            {/* Center dot at country centroid */}
            <circle
              cx={hoveredCentroid[0]}
              cy={hoveredCentroid[1]}
              r="2.5"
              fill="currentColor"
              className="text-foreground"
            />
            {/* Diagonal line extending from center */}
            <line
              x1={hoveredCentroid[0]}
              y1={hoveredCentroid[1]}
              x2={hoveredCentroid[0] + 35}
              y2={hoveredCentroid[1] - 35}
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-foreground"
              opacity="0.8"
              strokeDasharray="56.57"
              strokeDashoffset="0"
              style={{
                animation: "drawLine 0.3s ease-out forwards",
              }}
            />
            <g
              style={{
                animation: "fadeIn 0.3s ease-out forwards",
              }}
            >
            <text
                x={hoveredCentroid[0] + 40}
                y={hoveredCentroid[1] - 38}
              className="text-foreground font-medium"
              fontSize="14"
              textAnchor="start"
              style={{ pointerEvents: "none" }}
            >
              {hoveredCountryName}
            </text>
              {/* Underline connecting to diagonal line */}
              <line
                x1={hoveredCentroid[0] + 35}
                y1={hoveredCentroid[1] - 35}
                x2={hoveredCentroid[0] + 45 + hoveredCountryName.length * 7}
                y2={hoveredCentroid[1] - 35}
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-foreground"
                opacity="0.8"
                strokeDasharray={hoveredCountryName.length * 7 + 5}
                strokeDashoffset="0"
                style={{
                  animation: "ease-in 1s forwards",
                }}
              />
            </g>
          </g>
        )}
      </ComposableMap>
      <SidePanel
        destination={selectedDestination}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
      />
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
