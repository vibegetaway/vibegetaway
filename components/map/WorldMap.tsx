'use client'

import { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Destination } from '@/lib/generateDestinationInfo'
import { COUNTRY_CENTROIDS } from '@/lib/countryCentroids'
import { SidePanel } from '@/components/panels/SidePanel'
import { DestinationOverlay } from '@/components/map/DestinationOverlay'
import { MapZoomControls } from '@/components/map/MapZoomControls'

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface WorldMapProps {
  loading: boolean
  destinations?: Destination[]
  selectedDestination?: Destination | null
  onDestinationSelect?: (destination: Destination | null) => void
  isSidebarOpen?: boolean
}

// Create custom purple marker icons
const createPurpleIcon = (isSelected: boolean, hasDetails: boolean) => {
  const color = isSelected ? '#6366f1' : hasDetails ? '#8b5cf6' : '#a78bfa'

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.25);
        transform: translate(-50%, -50%);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

// Component to handle map events and hide overlay on interaction
function MapEventHandler({ onMapInteraction }: { onMapInteraction: () => void }) {
  const map = useMap()

  useEffect(() => {
    const handleInteraction = () => {
      onMapInteraction()
    }

    // Hide overlay when user interacts with map
    map.on('movestart', handleInteraction)
    map.on('zoomstart', handleInteraction)
    map.on('click', handleInteraction)

    return () => {
      map.off('movestart', handleInteraction)
      map.off('zoomstart', handleInteraction)
      map.off('click', handleInteraction)
    }
  }, [map, onMapInteraction])

  return null
}

// Component to update map when destinations change
function DestinationMarkers({
  destinations,
  selectedDestination,
  onMarkerClick,
  onMarkerHover,
  onMarkerLeave
}: {
  destinations: Destination[]
  selectedDestination: Destination | null
  onMarkerClick: (dest: Destination) => void
  onMarkerHover: (dest: Destination, e: L.LeafletMouseEvent) => void
  onMarkerLeave: () => void
}) {
  const map = useMap()

  useEffect(() => {
    if (destinations.length > 0) {
      // Fit bounds to show all markers
      const bounds = destinations
        .filter(d => d.coordinates)
        .map(d => [d.coordinates!.lat, d.coordinates!.lng] as [number, number])

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 4 })
      }
    }
  }, [destinations, map])

  return (
    <>
      {destinations.map((dest, index) => {
        const position: [number, number] = dest.coordinates
          ? [dest.coordinates.lat, dest.coordinates.lng]
          : COUNTRY_CENTROIDS[dest.country] || [0, 0]

        const isSelected = selectedDestination?.region === dest.region &&
          selectedDestination?.country === dest.country
        const hasDetails = !!(dest.description && dest.pricing)

        return (
          <Marker
            key={`${dest.country}-${dest.region}-${index}`}
            position={position}
            icon={createPurpleIcon(isSelected, hasDetails)}
            eventHandlers={{
              click: () => onMarkerClick(dest),
              mouseover: (e) => onMarkerHover(dest, e),
              mouseout: () => onMarkerLeave(),
            }}
          />
        )
      })}
    </>
  )
}

export default function WorldMap({
  loading,
  destinations = [],
  selectedDestination: externalSelectedDestination = null,
  onDestinationSelect,
  isSidebarOpen = false
}: WorldMapProps) {
  const [hoveredDestination, setHoveredDestination] = useState<Destination | null>(null)
  const [internalSelectedDestination, setInternalSelectedDestination] = useState<Destination | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isHoveringOverlay, setIsHoveringOverlay] = useState(false)
  const overlayTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [overlayPosition, setOverlayPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Use external selectedDestination if provided, otherwise use internal
  const selectedDestination = externalSelectedDestination || internalSelectedDestination

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

  const handleMarkerClick = (destination: Destination) => {
    if (onDestinationSelect) {
      onDestinationSelect(destination)
    } else {
      setInternalSelectedDestination(destination)
    }
    setIsPanelOpen(true)
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    if (onDestinationSelect) {
      onDestinationSelect(null)
    } else {
      setInternalSelectedDestination(null)
    }
  }

  const handleMarkerHover = (destination: Destination, e: L.LeafletMouseEvent) => {
    if (overlayTimeoutRef.current) {
      clearTimeout(overlayTimeoutRef.current)
    }
    setOverlayPosition({
      x: e.originalEvent.clientX,
      y: e.originalEvent.clientY
    })
    setHoveredDestination(destination)
    setIsHoveringOverlay(false) // Reset when hovering a new marker
  }

  const handleMarkerLeave = () => {
    overlayTimeoutRef.current = setTimeout(() => {
      if (!isHoveringOverlay) {
        setHoveredDestination(null)
      }
    }, 50) // Reduced from 100ms for more responsive hiding
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          minZoom={2}
          maxBounds={[[-60, -180], [85, 180]]}
          scrollWheelZoom={true}
          zoomControl={false}
          className="w-full h-full"
          style={{ background: '#f8f9fa' }}
        >
          {/* Using CartoDB Positron - a much cleaner, simpler basemap with minimal labels */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={19}
          />
          <DestinationMarkers
            destinations={destinations}
            selectedDestination={selectedDestination}
            onMarkerClick={handleMarkerClick}
            onMarkerHover={handleMarkerHover}
            onMarkerLeave={handleMarkerLeave}
          />
          <MapEventHandler
            onMapInteraction={() => {
              setHoveredDestination(null)
              setIsHoveringOverlay(false)
              if (overlayTimeoutRef.current) {
                clearTimeout(overlayTimeoutRef.current)
              }
            }}
          />
          <MapZoomControls />
        </MapContainer>
      </div>

      <div className="relative z-40">
        <SidePanel
          destination={selectedDestination}
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          isSidebarOpen={isSidebarOpen}
        />
      </div>

      {(hoveredDestination || isHoveringOverlay) && hoveredDestination && (
        <div className="relative z-50">
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
              // Immediately clear both states when leaving overlay
              if (overlayTimeoutRef.current) {
                clearTimeout(overlayTimeoutRef.current)
              }
              setIsHoveringOverlay(false)
              setHoveredDestination(null)
            }}
          />
        </div>
      )}
    </div>
  )
}
