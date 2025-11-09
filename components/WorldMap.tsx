'use client'

import { useState, useRef } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

interface WorldMapProps {
  loading: boolean
  highlightedCountries?: string[]
}

export default function WorldMap({ loading, highlightedCountries = [] }: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)

  return (
    <div ref={containerRef} className="w-full h-full">
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
                const isHighlighted = highlightedCountries.includes(geo.properties.name)
                const fillPattern = loading 
                  ? "url(#dot-pattern-loading)"
                  : (isHovered || isHighlighted ? "url(#dot-pattern-blue)" : "url(#dot-pattern)")
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillPattern}
                    onMouseEnter={() => setHoveredCountry(geo.rsmKey)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", cursor: "pointer" },
                      pressed: { outline: "none" },
                    }}
                  />
                )
              })
          }
        </Geographies>
        
      </ComposableMap>
    </div>
  )
}

