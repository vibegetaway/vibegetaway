'use client'

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import { useEffect, useState, useMemo, useRef, memo, useCallback } from 'react'
import L from 'leaflet'
import Supercluster from 'supercluster'
import 'leaflet/dist/leaflet.css'
import { Search, X, Loader2, Home } from 'lucide-react'
import { SearchProgressIndicator } from './SearchProgressIndicator'
import { useExploreTyping } from '@/hooks/useExploreTyping'
import Image from 'next/image'
import { LocationOverviewDrawer } from './LocationOverviewDrawer'
import { LocationDetailsDrawer } from './LocationDetailsDrawer'

export interface Location {
  location: string      // City/area
  spot: string         // Specific landmark
  country: string
  latitude: number
  longitude: number
  description: string
  extended_description?: string
  best_time_to_visit?: string
  why_now?: string
  top_activities?: string[]
  nearby_attractions?: string[]
  practical_tips?: string
  travel_from_origin?: string
  image_keywords?: string
  match_reason?: string
  prominence_score: number
  reddit_source_urls: string[]
  image_url: string
  price_level?: string
  highlights?: string[]
  tips?: string[]
  activities?: string[]
  social_proof?: { quote: string; source: string }
}

interface ExploreMapProps {
  className?: string
  origin?: string
  originCoords?: { lat: number; lng: number } | null
  destinations?: string[]
  budget?: number | null
  travelMonth?: string | null
}

interface LocationProperties {
  cluster: boolean
  location: string
  spot: string
  country: string
  description: string
  highlights?: string[]
  activities?: string[]
  tips?: string[]
  image_keywords?: string
  prominence_score: number
  image_url: string
  price_level?: string
  social_proof?: { quote: string; source: string }
  latitude?: number
  longitude?: number
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

interface MemoizedMarkerProps {
  id: string
  position: [number, number]
  type: 'cluster' | 'location'
  clusterId?: number
  count?: number
  topLocation?: LocationProperties
  location?: LocationProperties
  supercluster: Supercluster | any
  onMarkerClick: (items: DrawerItem[], isCluster: boolean) => void
}

const MemoizedMarker = memo(({
  id,
  position,
  type,
  clusterId,
  count,
  topLocation,
  location,
  supercluster,
  onMarkerClick
}: MemoizedMarkerProps) => {

  const icon = useMemo(() => {
    if (type === 'cluster' && topLocation && count !== undefined) {
      return createClusterPin(topLocation.image_url, topLocation.spot, count, topLocation.prominence_score)
    } else if (type === 'location' && location) {
      return createCircularPin(location.image_url, location.spot, location.prominence_score, 50, location.price_level)
    }
    return L.divIcon({ className: '' })
  }, [type, topLocation, count, location])

  const eventHandlers = useMemo(() => {
    return {
      click: () => {
        if (type === 'cluster' && supercluster && clusterId !== undefined) {
          // Get all items in the cluster
          const points = supercluster.getLeaves(clusterId, Infinity)
          const items: DrawerItem[] = points
            .map((point: any) => ({
              spot: point.properties.spot,
              location: point.properties.location,
              country: point.properties.country,
              description: point.properties.description,
              extended_description: point.properties.extended_description,
              best_time_to_visit: point.properties.best_time_to_visit,
              why_now: point.properties.why_now,
              top_activities: point.properties.top_activities,
              nearby_attractions: point.properties.nearby_attractions,
              practical_tips: point.properties.practical_tips,
              travel_from_origin: point.properties.travel_from_origin,
              image_keywords: point.properties.image_keywords,
              match_reason: point.properties.match_reason,
              image_url: point.properties.image_url,
              prominence_score: point.properties.prominence_score,
              price_level: point.properties.price_level,
              social_proof: point.properties.social_proof,
            }))
            .sort((a: DrawerItem, b: DrawerItem) => b.prominence_score - a.prominence_score)
          onMarkerClick(items, true)
        } else if (type === 'location' && location) {
          // Single item
          const items: DrawerItem[] = [{
            spot: location.spot,
            location: location.location,
            country: location.country,
            description: location.description,
            highlights: location.highlights,
            activities: location.activities,
            tips: location.tips,
            image_keywords: location.image_keywords,
            image_url: location.image_url,
            prominence_score: location.prominence_score,
            price_level: location.price_level,
            social_proof: location.social_proof,
          }]
          onMarkerClick(items, false)
        }
      }
    }
  }, [type, supercluster, clusterId, topLocation, count, location, onMarkerClick])

  return <Marker position={position} icon={icon} eventHandlers={eventHandlers} />
}, (prev, next) => {
  return (
    prev.id === next.id &&
    prev.position[0] === next.position[0] &&
    prev.position[1] === next.position[1] &&
    prev.count === next.count &&
    prev.topLocation === next.topLocation &&
    prev.location === next.location &&
    prev.supercluster === next.supercluster &&
    prev.onMarkerClick === next.onMarkerClick
  )
})

export interface DrawerItem {
  spot: string
  location: string
  country: string
  description: string
  highlights?: string[]
  activities?: string[]
  tips?: string[]
  image_keywords?: string
  image_url: string
  prominence_score: number
  price_level?: string
  social_proof?: { quote: string; source: string }
}

// Convert prominence score to star rating (supports half stars)
const getStarsFromProminence = (score: number): number => {
  // 10: 5 stars, 9: 4.5, 8: 4, 7: 3.5, etc.
  return score / 2
}

// Create circular image pin
const createCircularPin = (imageUrl: string, locationName: string, prominenceScore: number = 0, size: number = 50, priceLevel?: string) => {
  const isSpecialPin = prominenceScore === 10
  const starBadge = isSpecialPin ? `
    <div class="star-badge" style="
      position: absolute;
      bottom: -4px;
      right: -4px;
      width: 20px;
      height: 20px;
      background: white;
      border: 2px solid #FFD700;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      z-index: 10;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    ">⭐</div>
  ` : ''

  const priceBadge = priceLevel ? `
    <div class="price-badge" style="
      position: absolute;
      top: -4px;
      left: 50%;
      transform: translateX(-50%);
      background: #8b5cf6;
      color: white;
      padding: 1px 6px;
      border-radius: 10px;
      font-size: 9px;
      font-weight: 700;
      z-index: 11;
      width: max-content;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      border: 1px solid white;
    ">${priceLevel}</div>
  ` : ''

  return L.divIcon({
    className: 'custom-circular-marker',
    html: `
      <div class="circular-pin-container">
        <div class="circular-pin" style="width: ${size}px; height: ${size}px;">
          <div class="pin-image-wrapper" style="width: ${size}px; height: ${size}px;">
            <img src="${imageUrl}" alt="location" class="pin-image" />
          </div>
          ${starBadge}
          ${priceBadge}
        </div>
        <div class="pin-label">${locationName}</div>
      </div>
    `,
    iconSize: [size + 20, size + 35],
    iconAnchor: [(size + 20) / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

// Create cluster icon (looks same as leaf pin - white border, no number)
const createClusterPin = (imageUrl: string, locationName: string, count: number, prominenceScore: number = 0) => {
  const size = 50
  const isSpecialPin = prominenceScore === 10
  const starBadge = isSpecialPin ? `
    <div class="star-badge" style="
      position: absolute;
      bottom: -4px;
      right: -4px;
      width: 20px;
      height: 20px;
      background: white;
      border: 2px solid #FFD700;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      z-index: 10;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    ">⭐</div>
  ` : ''

  return L.divIcon({
    className: 'custom-circular-marker',
    html: `
      <div class="circular-pin-container">
        <div class="circular-pin" style="width: ${size}px; height: ${size}px;">
          <div class="pin-image-wrapper" style="width: ${size}px; height: ${size}px;">
            <img src="${imageUrl}" alt="location" class="pin-image" />
          </div>
          ${starBadge}
        </div>
        <div class="pin-label-wrapper">
          <div class="pin-label">${locationName}</div>
          <div class="pin-label-count">+ ${count - 1} more</div>
        </div>
      </div>
    `,
    iconSize: [size + 20, size + 45],
    iconAnchor: [(size + 20) / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

function MapController({
  locations,
  onMarkerClick,
  searchBounds
}: {
  locations: Location[]
  onMarkerClick: (items: DrawerItem[], isCluster: boolean) => void
  searchBounds: L.LatLngBounds | null
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
  }, [map])

  // Create supercluster instance
  const supercluster = useMemo(() => {
    const cluster = new Supercluster({
      radius: 120,
      maxZoom: 20,
      minZoom: 0,
      map: (props) => ({
        topLocation: props,
        maxProminence: props.prominence_score,
        topLat: props.latitude,
        topLng: props.longitude
      }),
      reduce: (accumulated, props) => {
        if (props.maxProminence > accumulated.maxProminence) {
          accumulated.maxProminence = props.maxProminence
          accumulated.topLocation = props.topLocation
          accumulated.topLat = props.topLat
          accumulated.topLng = props.topLng
        }
      }
    })

    // Convert locations to GeoJSON points
    const points = locations.map(loc => ({
      type: 'Feature' as const,
      properties: {
        cluster: false,
        location: loc.location,
        spot: loc.spot,
        country: loc.country,
        description: loc.description,
        highlights: loc.highlights || loc.top_activities,
        activities: loc.activities || loc.nearby_attractions,
        tips: loc.tips || (loc.practical_tips ? [loc.practical_tips] : []),
        image_keywords: loc.image_keywords,
        prominence_score: loc.prominence_score,
        image_url: loc.image_url,
        price_level: loc.price_level,
        social_proof: loc.social_proof,
        // Add coordinates to properties for supercluster map/reduce
        latitude: loc.latitude,
        longitude: loc.longitude
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
      const { cluster: isCluster, point_count, topLocation, topLat, topLng } = cluster.properties

      if (isCluster) {
        // Use pre-calculated topLocation and coordinates from Supercluster reduce
        // Fallback to cluster centroid if topLat/topLng are missing (shouldn't happen)
        const displayLat = topLat !== undefined ? topLat : latitude
        const displayLng = topLng !== undefined ? topLng : longitude

        return {
          id: `cluster-${cluster.id}`,
          position: [displayLat, displayLng] as [number, number],
          isCluster: true,
          count: point_count,
          topLocation: topLocation as LocationProperties,
          clusterId: cluster.id as number,
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
      {markers.map((marker: ProcessedMarker) => (
        <MemoizedMarker
          key={marker.id}
          id={marker.id}
          position={marker.position}
          type={marker.isCluster ? 'cluster' : 'location'}
          clusterId={marker.clusterId}
          count={marker.count}
          topLocation={marker.topLocation}
          location={marker.location}
          supercluster={supercluster}
          onMarkerClick={onMarkerClick}
        />
      ))}
    </>
  )
}

const createOriginPin = (originName: string) => {
  return L.divIcon({
    className: 'origin-home-marker',
    html: `
      <div class="origin-pin-container">
        <div class="origin-pin">
          <svg class="home-icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <div class="origin-label">${originName}</div>
      </div>
    `,
    iconSize: [60, 70],
    iconAnchor: [30, 50],
    popupAnchor: [0, -50],
  })
}

export default function ExploreMap({ className, origin, originCoords, destinations, budget, travelMonth }: ExploreMapProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [isClient, setIsClient] = useState(false)
  const [drawerItems, setDrawerItems] = useState<DrawerItem[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isClusterView, setIsClusterView] = useState(false)
  const [isShowingAllFromSearch, setIsShowingAllFromSearch] = useState(false)
  const [selectedDetailLocation, setSelectedDetailLocation] = useState<DrawerItem | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchBounds, setSearchBounds] = useState<L.LatLngBounds | null>(null)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingStage, setLoadingStage] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const typingPlaceholder = useExploreTyping({
    enabled: !searchQuery && !isSearchFocused
  })


  // Handle search submit (Enter key)
  const handleSearchSubmit = async () => {
    const query = searchQuery

    if (!query.trim()) return

    // Mark search as active to disable viewport fetching
    setIsSearchActive(true)

    // Remove search focus immediately so map appears while loading
    setIsSearchFocused(false)

    // Fetch locations from backend with the search query (ignores viewport)
    await streamExploreSearch(query)
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchBounds(null)
    setIsSearchFocused(false)
    setIsSearchActive(false)
    setLoadingProgress(0)
    setLoadingStage('')
    // Clear locations when search is cleared
    setLocations([])
    // Clear progress interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
  }

  // Phase 2: Enrich locations
  const streamEnrichmentLoop = async (locationsToEnrich: Location[]) => {
    setLoadingStage('Gathering local details (Gemini Flash)...')

    try {
      const response = await fetch('/api/explore/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locations: locationsToEnrich.map(l => ({
            spot: l.spot,
            location: l.location,
            country: l.country
          })),
          query: searchQuery,
          origin: origin,
          budget: budget,
          travelMonth: travelMonth
        })
      })

      if (!response.ok) {
        console.error(`Enrichment API failed with status: ${response.status} ${response.statusText}`)
      }

      if (!response.body) return

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const freshData = JSON.parse(line)

            if (freshData.spot) {
              setLocations(prev => prev.map(loc => {
                const isMatch = (freshData.spot === loc.spot) ||
                  (freshData.location === loc.location && freshData.country === loc.country)

                if (isMatch) {
                  let newImageUrl = loc.image_url
                  // Update image if we have better keywords now
                  if (freshData.image_keywords && !loc.image_keywords && freshData.image_keywords !== loc.image_keywords) {
                    newImageUrl = `/api/images/cached-images?keywords=${encodeURIComponent(freshData.image_keywords)}`
                  }

                  return {
                    ...loc,
                    price_level: freshData.price_level,
                    highlights: freshData.highlights,
                    activities: freshData.activities,
                    tips: freshData.tips,
                    image_keywords: freshData.image_keywords,
                    image_url: newImageUrl,
                    social_proof: freshData.social_proof
                  }
                }
                return loc
              }))
              // Increment progress slightly for visual feedback
              setLoadingProgress(p => Math.min(95, p + 2))
            }
          } catch (e) {
            // incomplete chunks are fine, wait for buffer
          }
        }
      }
    } catch (e) {
      console.error("Enrichment stream error", e)
    } finally {
      setIsLoading(false)
      setLoadingProgress(100)
      setLoadingStage('Search complete')
    }
  }

  const streamExploreSearch = async (query: string = '') => {
    if (!query.trim()) {
      setLocations([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setLoadingProgress(0)
    setLoadingStage('Connecting to Sonar-Pro...')
    setLocations([])

    const params = new URLSearchParams({ q: query })
    if (origin) params.append('origin', origin)
    if (destinations && destinations.length > 0) params.append('destinations', destinations.join(','))
    if (budget !== null && budget !== undefined) params.append('budget', budget.toString())
    if (travelMonth) params.append('travelMonth', travelMonth)

    const url = `/api/explore/search?${params.toString()}`

    let collectedLocations: Location[] = []

    try {
      const response = await fetch(url)
      const reader = response.body?.getReader()
      if (!reader) {
        setIsLoading(false)
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let locationCount = 0

      setLoadingStage('Discovering locations...')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue

          const data = line.slice(6).trim()
          if (!data) continue

          if (data === '[DONE]') continue

          try {
            const event = JSON.parse(data)

            if (event.type === 'location' && event.data) {
              const loc = event.data
              const imageUrl = `/api/images/cached-images?keywords=${encodeURIComponent(`${loc.spot} ${loc.location}`)}`

              const location: Location = {
                location: loc.location || '',
                spot: loc.spot || '',
                country: loc.country || '',
                latitude: loc.latitude || 0,
                longitude: loc.longitude || 0,
                description: loc.description || '',
                prominence_score: loc.prominence_score || 5,
                reddit_source_urls: loc.reddit_source_urls || [],
                image_url: imageUrl,
                highlights: [],
                activities: [],
                tips: [],
                image_keywords: '',
                price_level: ''
              }

              locationCount++
              collectedLocations.push(location)
              setLocations(prev => [...prev, location])
              setLoadingProgress(Math.min(50, locationCount * 8))
              setLoadingStage(`Found ${locationCount} destination${locationCount > 1 ? 's' : ''}...`)
            }
          } catch (e) {
            // ignore parse errors
          }
        }
      }

      // Phase 1 finished
      if (collectedLocations.length > 0) {
        await streamEnrichmentLoop(collectedLocations)
      } else {
        setIsLoading(false)
        setLoadingStage('No results found')
      }

    } catch (error) {
      console.error('Error streaming locations:', error)
      setIsLoading(false)
    }
  }



  useEffect(() => {
    setIsClient(true)

    // Cleanup progress interval on unmount
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
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

  const handleMarkerClick = useCallback((items: DrawerItem[], isCluster: boolean) => {
    setDrawerItems(items)
    setIsClusterView(isCluster)
    setIsShowingAllFromSearch(false)
    setIsDrawerOpen(true)
  }, [])

  // Map locations to drawer items helper
  const mapLocationsToDrawerItems = (locationsList: Location[]): DrawerItem[] => {
    return locationsList
      .map(loc => ({
        spot: loc.spot,
        location: loc.location,
        country: loc.country,
        description: loc.description,
        highlights: loc.highlights,
        activities: loc.activities,
        tips: loc.tips,
        image_keywords: loc.image_keywords,
        image_url: loc.image_url,
        prominence_score: loc.prominence_score,
        price_level: loc.price_level,
        social_proof: loc.social_proof,
      }))
      .sort((a, b) => b.prominence_score - a.prominence_score)
  }

  // Update handleShowAllLocations to pass new properties
  const handleShowAllLocations = () => {
    if (locations.length === 0) return

    setDrawerItems(mapLocationsToDrawerItems(locations))
    setIsClusterView(true)
    setIsShowingAllFromSearch(true)
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setIsShowingAllFromSearch(false)
  }

  // Keep drawer updated with new locations if showing all from search
  useEffect(() => {
    if (isShowingAllFromSearch && isDrawerOpen) {
      setDrawerItems(mapLocationsToDrawerItems(locations))
    }
  }, [locations, isShowingAllFromSearch, isDrawerOpen])

  if (!isClient) {
    return <div className={className} />
  }

  return (
    <div className={className}>
      {/* Search Bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4">
        <div className="relative">
          {/* Shadow layer - matches search bar dimensions only */}
          <div className="absolute top-0 left-0 right-0 h-12 z-[1] rounded-full shadow-lg pointer-events-none" />

          <div className="relative z-[20] flex items-center gap-2 bg-white rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-violet-500">
            {/* App icon on mobile */}
            <div className="md:hidden flex-shrink-0 pl-2">
              <Image
                src="/assets/icon.png"
                width={36}
                height={36}
                alt="VibeGetaway"
                className="rounded-lg"
              />
            </div>
            {/* Search icon on desktop */}
            <Search className="hidden md:block absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit()
                  searchInputRef.current?.blur()
                }
              }}
              placeholder=""
              className="flex-1 md:pl-10 pr-10 py-3 bg-transparent text-gray-900 focus:outline-none"
            />
            {/* Typing animated placeholder */}
            {!searchQuery && !isSearchFocused && typingPlaceholder && (
              <div className="absolute left-14 md:left-10 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="text-gray-400 text-base">{typingPlaceholder}</span>
              </div>
            )}
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Overlay to hide map when search is focused */}
      {isSearchFocused && (
        <div
          className="absolute inset-0 bg-gray-100 z-[999]"
          onClick={() => setIsSearchFocused(false)}
        />
      )}

      {/* Floating progress indicator - bottom right above mobile nav */}
      <SearchProgressIndicator
        isLoading={isLoading}
        destinationCount={locations.length}
        isSearchActive={isSearchActive}
        onClick={handleShowAllLocations}
      />

      <style jsx global>{`
        .custom-circular-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .circular-pin-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
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
        
        .pin-label-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0px;
        }
        
        .pin-label {
          font-family: 'Geist', sans-serif;
          font-size: 11px;
          font-weight: 600;
          color: #1a1a1a;
          text-align: center;
          white-space: nowrap;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .pin-label-count {
          font-family: 'Geist', sans-serif;
          font-size: 10px;
          font-weight: 500;
          color: #6b7280;
          text-align: center;
          white-space: nowrap;
        }

        /* Origin/Home Pin Styles */
        .origin-home-marker {
          background: transparent !important;
          border: none !important;
        }

        .origin-pin-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .origin-pin {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 3px solid white;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .origin-pin:hover {
          transform: rotate(-45deg) scale(1.1);
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15);
        }

        .origin-pin .home-icon {
          width: 20px;
          height: 20px;
          transform: rotate(45deg);
        }

        .origin-label {
          font-family: 'Geist', sans-serif;
          font-size: 11px;
          font-weight: 600;
          color: #6d28d9;
          background: white;
          padding: 2px 8px;
          border-radius: 10px;
          white-space: nowrap;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
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

        {/* Origin/Home marker */}
        {originCoords && origin && (
          <Marker
            position={[originCoords.lat, originCoords.lng]}
            icon={createOriginPin(origin)}
          />
        )}

        <MapController
          locations={locations}
          onMarkerClick={handleMarkerClick}
          searchBounds={searchBounds}
        />
      </MapContainer>

      {/* Result Drawered */}
      <LocationOverviewDrawer
        isOpen={isDrawerOpen}
        items={drawerItems}
        isClusterView={isClusterView}
        onClose={closeDrawer}
        onItemClick={(item) => setSelectedDetailLocation(item)}
      />

      <LocationDetailsDrawer
        isOpen={selectedDetailLocation !== null}
        location={selectedDetailLocation}
        onClose={() => setSelectedDetailLocation(null)}
      />
    </div>
  )
}
