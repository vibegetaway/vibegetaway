'use client'

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import { useEffect, useState, useMemo, useRef } from 'react'
import L from 'leaflet'
import Supercluster from 'supercluster'
import 'leaflet/dist/leaflet.css'
import { Search, X, MapPin, Loader2 } from 'lucide-react'

interface Location {
  location: string      // City/area
  logical_location: string  // Logical grouping (e.g., Bali)
  spot: string         // Specific landmark
  country: string
  latitude: number
  longitude: number
  activity: string
  description: string
  price_class: string
  prominence_score: number
  tags: string
  image_url: string
}

interface ExploreMapProps {
  className?: string
}

interface LocationProperties {
  cluster: boolean
  location: string     // City/area
  spot: string        // Specific landmark
  country: string
  activity: string
  description: string
  price_class: string
  prominence_score: number
  tags: string
  image_url: string
}

interface ProcessedMarker {
  id: string
  position: [number, number]
  isCluster: boolean
  count?: number
  topLocation?: LocationProperties
  location?: LocationProperties
  clusterId?: number
}

interface DrawerItem {
  spot: string
  location: string
  country: string
  description: string
  tags: string
  image_url: string
  activity: string
  price_class: string
  prominence_score: number
}

// Create circular image pin
const createCircularPin = (imageUrl: string, size: number = 50) => {
  return L.divIcon({
    className: 'custom-circular-marker',
    html: `
      <div class="circular-pin" style="width: ${size}px; height: ${size}px;">
        <div class="pin-image-wrapper" style="width: ${size}px; height: ${size}px;">
          <img src="${imageUrl}" alt="location" class="pin-image" />
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

// Create cluster icon (looks same as leaf pin - white border, no number)
const createClusterPin = (imageUrl: string, count: number) => {
  const size = 50
  return L.divIcon({
    className: 'custom-circular-marker',
    html: `
      <div class="circular-pin" style="width: ${size}px; height: ${size}px;">
        <div class="pin-image-wrapper" style="width: ${size}px; height: ${size}px;">
          <img src="${imageUrl}" alt="location" class="pin-image" />
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

function MapController({ 
  locations, 
  onMarkerClick,
  searchBounds,
  onViewportChange
}: { 
  locations: Location[]
  onMarkerClick: (items: DrawerItem[], isCluster: boolean) => void
  searchBounds: L.LatLngBounds | null
  onViewportChange: (bounds: L.LatLngBounds) => void
}) {
  const map = useMap()
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null)
  const [zoom, setZoom] = useState(map.getZoom())

  // Pan and zoom to search results
  useEffect(() => {
    if (searchBounds) {
      map.fitBounds(searchBounds, { padding: [50, 50], maxZoom: 12 })
    }
  }, [searchBounds, map])

  useEffect(() => {
    const updateBounds = () => {
      const newBounds = map.getBounds()
      const newZoom = map.getZoom()
      
      // Only update if bounds or zoom actually changed
      setBounds(prevBounds => {
        if (!prevBounds || 
            !prevBounds.equals(newBounds)) {
          // Notify parent of viewport change
          onViewportChange(newBounds)
          return newBounds
        }
        return prevBounds
      })
      
      setZoom(prevZoom => {
        if (prevZoom !== newZoom) {
          return newZoom
        }
        return prevZoom
      })
    }

    updateBounds()
    map.on('moveend', updateBounds)
    map.on('zoomend', updateBounds)

    return () => {
      map.off('moveend', updateBounds)
      map.off('zoomend', updateBounds)
    }
  }, [map, onViewportChange])

  // Create supercluster instance
  const supercluster = useMemo(() => {
    const cluster = new Supercluster({
      radius: 120,
      maxZoom: 20,
      minZoom: 0,
    })

    // Convert locations to GeoJSON points
    const points = locations.map(loc => ({
      type: 'Feature' as const,
      properties: {
        cluster: false,
        location: loc.location,
        spot: loc.spot,
        country: loc.country,
        activity: loc.activity,
        description: loc.description,
        price_class: loc.price_class,
        prominence_score: loc.prominence_score,
        tags: loc.tags,
        image_url: loc.image_url,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [loc.longitude, loc.latitude],
      },
    }))

    cluster.load(points)
    return cluster
  }, [locations])

  // Get clusters for current map bounds
  const clusters = useMemo(() => {
    if (!bounds || !supercluster) return []

    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ]

    return supercluster.getClusters(bbox, Math.floor(zoom))
  }, [bounds, zoom, supercluster])

  // Process clusters to find highest prominence location
  const markers = useMemo(() => {
    return clusters.map((cluster: any): ProcessedMarker => {
      const [longitude, latitude] = cluster.geometry.coordinates
      const { cluster: isCluster, point_count } = cluster.properties

      if (isCluster) {
        // Get all points in this cluster
        const clusterId = cluster.id as number
        const points = supercluster.getLeaves(clusterId, Infinity)
        
        // Find the point with highest prominence_score
        const topLocation = points.reduce((max: any, point: any) => {
          return point.properties.prominence_score > max.properties.prominence_score ? point : max
        }, points[0])

        return {
          id: `cluster-${clusterId}`,
          position: [latitude, longitude] as [number, number],
          isCluster: true,
          count: point_count,
          topLocation: topLocation.properties as LocationProperties,
          clusterId: clusterId,
        }
      } else {
        // Single location
        return {
          id: `location-${latitude}-${longitude}`,
          position: [latitude, longitude] as [number, number],
          isCluster: false,
          location: cluster.properties as LocationProperties,
        }
      }
    })
  }, [clusters, supercluster])

  return (
    <>
      {markers.map((marker: ProcessedMarker) => {
        if (marker.isCluster && marker.topLocation && marker.clusterId !== undefined) {
          return (
            <Marker
              key={marker.id}
              position={marker.position}
              icon={createClusterPin(marker.topLocation.image_url, marker.count || 0)}
              eventHandlers={{
                click: () => {
                  // Get all items in the cluster
                  const points = supercluster.getLeaves(marker.clusterId!, Infinity)
                  const items: DrawerItem[] = points
                    .map((point: any) => ({
                      spot: point.properties.spot,
                      location: point.properties.location,
                      country: point.properties.country,
                      description: point.properties.description,
                      tags: point.properties.tags,
                      image_url: point.properties.image_url,
                      activity: point.properties.activity,
                      price_class: point.properties.price_class,
                      prominence_score: point.properties.prominence_score,
                    }))
                    .sort((a, b) => b.prominence_score - a.prominence_score)
                  onMarkerClick(items, true)
                },
              }}
            />
          )
        } else if (marker.location) {
          return (
            <Marker
              key={marker.id}
              position={marker.position}
              icon={createCircularPin(marker.location.image_url)}
              eventHandlers={{
                click: () => {
                  // Single item
                  const items: DrawerItem[] = [{
                    spot: marker.location!.spot,
                    location: marker.location!.location,
                    country: marker.location!.country,
                    description: marker.location!.description,
                    tags: marker.location!.tags,
                    image_url: marker.location!.image_url,
                    activity: marker.location!.activity,
                    price_class: marker.location!.price_class,
                    prominence_score: marker.location!.prominence_score,
                  }]
                  onMarkerClick(items, false)
                },
              }}
            />
          )
        } else {
          return null
        }
      })}
    </>
  )
}

export default function ExploreMap({ className }: ExploreMapProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [isClient, setIsClient] = useState(false)
  const [drawerItems, setDrawerItems] = useState<DrawerItem[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isClusterView, setIsClusterView] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [canDragDrawer, setCanDragDrawer] = useState(false)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchBounds, setSearchBounds] = useState<L.LatLngBounds | null>(null)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Compute autocomplete suggestions - only from location, logical_location, country
  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim() || !isSearchFocused) return []
    
    const query = searchQuery.toLowerCase().trim()
    const uniqueAreas = new Map<string, { label: string; location: Location; type: 'location' | 'logical_location' | 'country' }>()
    
    // Search only in location, logical_location, and country columns
    locations.forEach(loc => {
      // Check location field
      if (loc.location && loc.location.toLowerCase().includes(query)) {
        const key = `location-${loc.location}-${loc.country}`
        if (!uniqueAreas.has(key)) {
          uniqueAreas.set(key, {
            label: `${loc.location}, ${loc.country}`,
            location: loc,
            type: 'location'
          })
        }
      }
      
      // Check logical_location field
      if (loc.logical_location && loc.logical_location.toLowerCase().includes(query)) {
        const key = `logical-${loc.logical_location}-${loc.country}`
        if (!uniqueAreas.has(key)) {
          uniqueAreas.set(key, {
            label: `${loc.logical_location}, ${loc.country}`,
            location: loc,
            type: 'logical_location'
          })
        }
      }
      
      // Check country field
      if (loc.country && loc.country.toLowerCase().includes(query)) {
        const key = `country-${loc.country}`
        if (!uniqueAreas.has(key)) {
          uniqueAreas.set(key, {
            label: loc.country,
            location: loc,
            type: 'country'
          })
        }
      }
    })
    
    return Array.from(uniqueAreas.values()).slice(0, 10)
  }, [searchQuery, locations, isSearchFocused])

  // Handle search submit (Enter key or suggestion click)
  const handleSearchSubmit = async (selectedArea?: { label: string; location: Location; type: 'location' | 'logical_location' | 'country' }) => {
    const query = selectedArea ? selectedArea.label : (autocompleteSuggestions.length > 0 ? autocompleteSuggestions[0].label : searchQuery)
    
    if (!query.trim()) return
    
    // Mark search as active to disable viewport fetching
    setIsSearchActive(true)
    
    // Fetch locations from backend with the search query (ignores viewport)
    await fetchLocations(query)
    
    setIsSearchFocused(false)
    
    // After fetching, calculate bounds from the returned locations
    // The locations will be in the main state, so we use them directly
    setTimeout(() => {
      if (locations.length > 0) {
        const lats = locations.map(loc => loc.latitude)
        const lngs = locations.map(loc => loc.longitude)
        
        const bounds = L.latLngBounds(
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)]
        )
        
        setSearchBounds(bounds)
      }
    }, 100)
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: { label: string; location: Location; type: 'location' | 'logical_location' | 'country' }) => {
    setSearchQuery(suggestion.label)
    handleSearchSubmit(suggestion)
    searchInputRef.current?.blur()
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchBounds(null)
    setIsSearchFocused(false)
    setIsSearchActive(false)
    // Viewport-based loading will resume automatically on next map move
  }

  // Fetch locations from API
  const fetchLocations = async (query: string = '', bounds?: L.LatLngBounds) => {
    try {
      setIsLoading(true)
      let url = '/api/locations'
      const params = new URLSearchParams()
      
      if (query.trim()) {
        // Search query: ignore viewport
        params.append('q', query)
      } else if (bounds) {
        // No search: use viewport bounds
        const north = bounds.getNorth()
        const south = bounds.getSouth()
        const east = bounds.getEast()
        const west = bounds.getWest()
        params.append('viewport', `${north},${south},${east},${west}`)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url)
      const data = await response.json()
      setLocations(data.locations || [])
    } catch (error) {
      console.error('Error loading locations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced fetch for viewport changes
  const debouncedFetchViewport = (bounds: L.LatLngBounds) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      if (!isSearchActive) {
        fetchLocations('', bounds)
      }
    }, 300)
  }

  useEffect(() => {
    setIsClient(true)
    // Initial locations will be loaded when map viewport is ready
  }, [])

  // Prevent body scroll and pull-to-refresh when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      // Prevent pull-to-refresh on mobile
      document.body.style.overscrollBehavior = 'none'
      
      return () => {
        document.body.style.overflow = ''
        document.body.style.overscrollBehavior = ''
      }
    }
  }, [isDrawerOpen])

  const handleMarkerClick = (items: DrawerItem[], isCluster: boolean) => {
    setDrawerItems(items)
    setIsClusterView(isCluster)
    setIsDrawerOpen(true)
    setDragOffset(0)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setDragOffset(0)
  }

  // Attach native touch event listeners with passive: false
  useEffect(() => {
    const drawer = drawerRef.current
    if (!drawer || !isDrawerOpen) return

    let localDragStart: number | null = null
    let localCanDragDrawer = false
    let localDragOffset = 0

    const handleTouchStart = (e: TouchEvent) => {
      const startY = e.touches[0].clientY
      localDragStart = startY
      setDragStart(startY)
      
      // Check if content is at the top
      const content = contentRef.current
      if (content) {
        const isAtTop = content.scrollTop === 0
        localCanDragDrawer = isAtTop
        setCanDragDrawer(isAtTop)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (localDragStart === null) return
      
      const currentY = e.touches[0].clientY
      const diff = currentY - localDragStart
      
      // Check if content is at top
      const content = contentRef.current
      const isAtTop = content ? content.scrollTop === 0 : false
      
      // Only allow dragging the drawer down if:
      // 1. User is swiping down (diff > 0)
      // 2. Content was at top when touch started (localCanDragDrawer)
      // 3. Content is still at top (isAtTop)
      if (diff > 0 && localCanDragDrawer && isAtTop) {
        // Prevent pull-to-refresh when dragging the drawer down
        e.preventDefault()
        localDragOffset = diff
        setDragOffset(diff)
      } else if (diff < 0) {
        // Reset if user starts swiping up
        localDragOffset = 0
        setDragOffset(0)
      }
    }

    const handleTouchEnd = () => {
      if (localDragOffset > 100) {
        // Close if dragged down more than 100px
        closeDrawer()
      } else {
        // Snap back
        setDragOffset(0)
      }
      localDragStart = null
      localCanDragDrawer = false
      localDragOffset = 0
      setDragStart(null)
      setCanDragDrawer(false)
    }

    // Add event listeners with passive: false to allow preventDefault
    drawer.addEventListener('touchstart', handleTouchStart, { passive: false })
    drawer.addEventListener('touchmove', handleTouchMove, { passive: false })
    drawer.addEventListener('touchend', handleTouchEnd)

    return () => {
      drawer.removeEventListener('touchstart', handleTouchStart)
      drawer.removeEventListener('touchmove', handleTouchMove)
      drawer.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDrawerOpen])

  if (!isClient) {
    return <div className={className} />
  }

  return (
    <div className={className}>
      {/* Search Bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4">
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit()
                  searchInputRef.current?.blur()
                }
              }}
              placeholder="Search places, activities, countries..."
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 shadow-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg p-2 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
            </div>
          )}
          
          {/* Autocomplete Dropdown */}
          {isSearchFocused && autocompleteSuggestions.length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl max-h-[60vh] overflow-y-auto">
              {autocompleteSuggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.label}-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 text-left"
                >
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 truncate">
                      {suggestion.label}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overlay to hide map when search is focused */}
      {isSearchFocused && (
        <div 
          className="absolute inset-0 bg-gray-100 z-[999]"
          onClick={() => setIsSearchFocused(false)}
        />
      )}

      <style jsx global>{`
        .custom-circular-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .circular-pin {
          position: relative;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        
        .circular-pin:hover {
          transform: scale(1.15);
          z-index: 1000 !important;
        }
        
        .pin-image-wrapper {
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          background: white;
        }
        
        .pin-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          min-width: 50px;
          min-height: 50px;
        }
      `}</style>
      
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={0.7}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full"
        style={{ background: '#f8f9fa' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        
        <MapController 
          locations={locations} 
          onMarkerClick={handleMarkerClick}
          searchBounds={searchBounds}
          onViewportChange={debouncedFetchViewport}
        />
      </MapContainer>

      {/* Bottom Drawer */}
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 z-[9998] transition-opacity"
            onClick={closeDrawer}
            style={{ 
              opacity: dragOffset > 0 ? Math.max(0, 1 - dragOffset / 300) : 1 
            }}
          />
          
          {/* Drawer */}
          <div
            ref={drawerRef}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[9999] max-h-[80vh] flex flex-col"
            style={{
              transform: `translateY(${dragOffset}px)`,
              transition: dragStart === null ? 'transform 0.3s ease-out' : 'none',
              overscrollBehavior: 'contain',
            }}
          >
            {/* Handle bar */}
            <div 
              className="pt-3 pb-2 flex justify-center"
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 pb-3 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {isClusterView 
                  ? `${drawerItems.length} Places` 
                  : drawerItems[0]?.spot
                }
              </h2>
              {!isClusterView && drawerItems[0] && (
                <p className="text-sm text-gray-500">
                  {drawerItems[0].location}, {drawerItems[0].country}
                </p>
              )}
            </div>

            {/* Content */}
            <div 
              ref={contentRef}
              className="flex-1 overflow-y-auto"
              style={{ overscrollBehavior: 'contain' }}
            >
              {drawerItems.map((item, index) => (
                <div 
                  key={index} 
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <div className="p-4 flex gap-3">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <img 
                        src={item.image_url} 
                        alt={item.spot}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-gray-900 mb-1 line-clamp-1">
                        {item.spot}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {item.location}, {item.country}
                      </p>
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        {item.tags.split(',').slice(0, 3).map((tag, i) => (
                          <span 
                            key={i}
                            className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
