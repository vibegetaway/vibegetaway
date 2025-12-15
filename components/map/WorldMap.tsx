'use client'

import { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Destination } from '@/lib/generateDestinationInfo'
import { COUNTRY_CENTROIDS } from '@/lib/countryCentroids'
import { DestinationInfoPanel } from '@/components/panels/DestinationInfoPanel'
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
  const hasFitBoundsRef = useRef(false)

  useEffect(() => {
    if (destinations.length > 0 && !hasFitBoundsRef.current) {
      // Fit bounds to show all markers - only do this once on initial load with coordinates
      const bounds = destinations
        .filter(d => d.coordinates)
        .map(d => [d.coordinates!.lat, d.coordinates!.lng] as [number, number])

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 4 })
        hasFitBoundsRef.current = true
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
  const [overlayPosition, setOverlayPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
    // Clear any pending hide timeout when hovering
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
    
    setOverlayPosition({
      x: e.originalEvent.clientX,
      y: e.originalEvent.clientY
    })
    setHoveredDestination(destination)
  }

  const handleMarkerLeave = () => {
    // Add a delay before hiding to allow cursor to move to overlay
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredDestination(null)
    }, 150) // 150ms delay
  }

  const cancelHideOverlay = () => {
    // Cancel hide when cursor enters overlay
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }

  const hideOverlay = () => {
    // Hide overlay when cursor leaves overlay area
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredDestination(null)
    }, 100) // Small delay for smoother UX
  }

  // Listen for overlay events
  useEffect(() => {
    const handleHideOverlay = () => {
      hideOverlay()
    }

    const handleCancelHide = () => {
      cancelHideOverlay()
    }

    window.addEventListener('hideDestinationOverlay' as any, handleHideOverlay)
    window.addEventListener('cancelHideDestinationOverlay' as any, handleCancelHide)

    return () => {
      window.removeEventListener('hideDestinationOverlay' as any, handleHideOverlay)
      window.removeEventListener('cancelHideDestinationOverlay' as any, handleCancelHide)
      
      // Clear timeout on unmount
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full">
      <div className="absolute inset-0 w-full h-full z-0">
        <MapContainer
          center={[20, 0]}
          zoom={2.25}
          minZoom={2}
          maxBounds={[[-60, -180], [85, 180]]}
          scrollWheelZoom={true}
          zoomControl={false}
          zoomSnap={0.1}
          zoomDelta={0.5}
          wheelPxPerZoomLevel={120}
          wheelDebounceTime={100}
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
            }}
          />
          <MapZoomControls />
        </MapContainer>
      </div>

      <div className="relative z-40">
        <DestinationInfoPanel
          destination={selectedDestination}
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          isSidebarOpen={isSidebarOpen}
        />
      </div>

      {hoveredDestination && (
        <div className="relative z-50">
          <DestinationOverlay
            destination={hoveredDestination}
            mousePosition={overlayPosition}
          />
        </div>
      )}
    </div>
  )
}
