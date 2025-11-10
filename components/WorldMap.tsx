'use client'

import { useState, useRef } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import type { Destination } from '@/lib/generateDestinationInfo'
import { DestinationOverlay } from './DestinationOverlay'
import { SidePanel } from './SidePanel'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// ISO 3166-1 alpha-3 → names/aliases from your list
const codeToCountry: Map<string, string[]> = new Map<string, string[]>([
  ["AFG", ["Afghanistan"]],
  ["ALB", ["Albania"]],
  ["DZA", ["Algeria"]],
  ["AND", []],
  ["AGO", ["Angola"]],
  ["ARG", ["Argentina"]],
  ["ARM", ["Armenia"]],
  ["ATA", ["Antarctica"]],
  ["AUS", ["Australia"]],
  ["AUT", ["Austria"]],
  ["AZE", ["Azerbaijan"]],
  ["BDI", ["Burundi"]],
  ["BEL", ["Belgium"]],
  ["BEN", ["Benin"]],
  ["BFA", ["Burkina Faso"]],
  ["BGD", ["Bangladesh"]],
  ["BGR", ["Bulgaria"]],
  ["BHS", ["Bahamas"]],
  ["BIH", ["Bosnia and Herz."]],
  ["BLR", ["Belarus"]],
  ["BLZ", ["Belize"]],
  ["BOL", ["Bolivia"]],
  ["BRA", ["Brazil"]],
  ["BRN", ["Brunei"]],
  ["BTN", ["Bhutan"]],
  ["BWA", ["Botswana"]],
  ["CAF", ["Central African Rep."]],
  ["CAN", ["Canada"]],
  ["CHE", ["Switzerland"]],
  ["CHL", ["Chile"]],
  ["CHN", ["China"]],
  ["CIV", ["Côte d'Ivoire"]],
  ["CMR", ["Cameroon"]],
  ["COD", ["Dem. Rep. Congo"]],
  ["COG", ["Congo"]],
  ["COL", ["Colombia"]],
  ["CRI", ["Costa Rica"]],
  ["CUB", ["Cuba"]],
  ["CYP", ["Cyprus", "N. Cyprus"]],
  ["CZE", ["Czechia"]],
  ["DEU", ["Germany"]],
  ["DNK", ["Denmark"]],
  ["DJI", ["Djibouti"]],
  ["DOM", ["Dominican Rep."]],
  ["ECU", ["Ecuador"]],
  ["EGY", ["Egypt"]],
  ["ERI", ["Eritrea"]],
  ["ESP", ["Spain"]],
  ["EST", ["Estonia"]],
  ["ETH", ["Ethiopia"]],
  ["FIN", ["Finland"]],
  ["FJI", ["Fiji"]],
  ["FLK", ["Falkland Is."]],
  ["FRA", ["France"]],
  ["GAB", ["Gabon"]],
  ["GBR", ["United Kingdom"]],
  ["GEO", ["Georgia"]],
  ["GHA", ["Ghana"]],
  ["GIN", ["Guinea"]],
  ["GMB", ["Gambia"]],
  ["GNB", ["Guinea-Bissau"]],
  ["GNQ", ["Eq. Guinea"]],
  ["GRC", ["Greece"]],
  ["GRL", ["Greenland"]],
  ["GTM", ["Guatemala"]],
  ["GUY", ["Guyana"]],
  ["HND", ["Honduras"]],
  ["HTI", ["Haiti"]],
  ["HUN", ["Hungary"]],
  ["IDN", ["Indonesia"]],
  ["IND", ["India"]],
  ["IRN", ["Iran"]],
  ["IRQ", ["Iraq"]],
  ["ISL", ["Iceland"]],
  ["ISR", ["Israel"]],
  ["ITA", ["Italy"]],
  ["JAM", ["Jamaica"]],
  ["JOR", ["Jordan"]],
  ["JPN", ["Japan"]],
  ["KAZ", ["Kazakhstan"]],
  ["KEN", ["Kenya"]],
  ["KGZ", ["Kyrgyzstan"]],
  ["KHM", ["Cambodia"]],
  ["KOR", ["South Korea"]],
  ["KWT", ["Kuwait"]],
  ["LAO", ["Laos"]],
  ["LBN", ["Lebanon"]],
  ["LBR", ["Liberia"]],
  ["LKA", ["Sri Lanka"]],
  ["LSO", ["Lesotho"]],
  ["LTU", ["Lithuania"]],
  ["LUX", ["Luxembourg"]],
  ["LVA", ["Latvia"]],
  ["MAR", ["Morocco"]],
  ["MDA", ["Moldova"]],
  ["MDG", ["Madagascar"]],
  ["MEX", ["Mexico"]],
  ["MKD", ["Macedonia"]],
  ["MLI", ["Mali"]],
  ["MMR", ["Myanmar"]],
  ["MNE", ["Montenegro"]],
  ["MNG", ["Mongolia"]],
  ["MOZ", ["Mozambique"]],
  ["MRT", ["Mauritania"]],
  ["MWI", ["Malawi"]],
  ["MYS", ["Malaysia"]],
  ["NAM", ["Namibia"]],
  ["NCL", ["New Caledonia"]],
  ["NER", ["Niger"]],
  ["NGA", ["Nigeria"]],
  ["NIC", ["Nicaragua"]],
  ["NLD", ["Netherlands"]],
  ["NOR", ["Norway"]],
  ["NPL", ["Nepal"]],
  ["NZL", ["New Zealand"]],
  ["OMN", ["Oman"]],
  ["PAK", ["Pakistan"]],
  ["PAN", ["Panama"]],
  ["PER", ["Peru"]],
  ["PHL", ["Philippines"]],
  ["PNG", ["Papua New Guinea"]],
  ["POL", ["Poland"]],
  ["PRK", ["North Korea"]],
  ["PRT", ["Portugal"]],
  ["PRY", ["Paraguay"]],
  ["QAT", ["Qatar"]],
  ["ROU", ["Romania"]],
  ["RUS", ["Russia"]],
  ["RWA", ["Rwanda"]],
  ["SAU", ["Saudi Arabia"]],
  ["SDN", ["Sudan"]],
  ["SEN", ["Senegal"]],
  ["SLB", ["Solomon Is."]],
  ["SLE", ["Sierra Leone"]],
  ["SLV", ["El Salvador"]],
  ["SRB", ["Serbia"]],
  ["SSD", ["S. Sudan"]],
  ["SVK", ["Slovakia"]],
  ["SVN", ["Slovenia"]],
  ["SWE", ["Sweden"]],
  ["SWZ", ["eSwatini"]],
  ["SYR", ["Syria"]],
  ["TCD", ["Chad"]],
  ["TGO", ["Togo"]],
  ["THA", ["Thailand"]],
  ["TJK", ["Tajikistan"]],
  ["TKM", ["Turkmenistan"]],
  ["TLS", ["Timor-Leste"]],
  ["TTO", ["Trinidad and Tobago"]],
  ["TUN", ["Tunisia"]],
  ["TUR", ["Turkey"]],
  ["TWN", ["Taiwan"]],
  ["TZA", ["Tanzania"]],
  ["UGA", ["Uganda"]],
  ["UKR", ["Ukraine"]],
  ["URY", ["Uruguay"]],
  ["USA", ["United States of America"]],
  ["UZB", ["Uzbekistan"]],
  ["VEN", ["Venezuela"]],
  ["VNM", ["Vietnam"]],
  ["VUT", ["Vanuatu"]],
  ["YEM", ["Yemen"]],
  ["ZAF", ["South Africa"]],
  ["ZMB", ["Zambia"]],
  ["ZWE", ["Zimbabwe"]],
  ["ARE", ["United Arab Emirates"]],
  ["ATF", ["Fr. S. Antarctic Lands"]],
  ["ESH", ["W. Sahara"]],
  ["IRL", ["Ireland"]],
  ["NCL", ["New Caledonia"]],
  ["SLB", ["Solomon Is."]],
  ["NZL", ["New Zealand"]],
  ["AUS", ["Australia"]],
  ["CHN", ["China"]],
  ["TWN", ["Taiwan"]],
  ["PRI", ["Puerto Rico"]],
  ["PSE", ["Palestine"]],
  ["SOM", ["Somalia", "Somaliland"]],
  ["KOS", ["Kosovo"]],
]);

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

