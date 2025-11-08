'use client'

import { useState, useEffect, useRef } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

export default function WorldMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        console.log(width, height)
        setDimensions({ width, height })
      }
    }

    // Set initial dimensions
    updateDimensions()

    // Update on window resize
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [0, 0],
          scale: 155,
        }}
        width={1000}
        height={1000}
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
        </defs>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies
              .filter((geo: any) => geo.properties.name !== 'Antarctica')
              .map((geo: any) => {
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="url(#dot-pattern)"
                  />
                )
              })
          }
        </Geographies>
        
      </ComposableMap>
    </div>
  )
}

