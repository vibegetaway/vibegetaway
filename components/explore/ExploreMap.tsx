'use client'

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import { useEffect, useState, useMemo, useRef } from 'react'
import L from 'leaflet'
import Supercluster from 'supercluster'
import 'leaflet/dist/leaflet.css'

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

// Create cluster icon with count badge
const createClusterPin = (imageUrl: string, count: number) => {
  const size = 50
  return L.divIcon({
    className: 'custom-circular-marker',
    html: `
      <div class="circular-pin cluster-pin" style="width: ${size}px; height: ${size}px;">
        <div class="pin-image-wrapper" style="width: ${size}px; height: ${size}px;">
          <img src="${imageUrl}" alt="location" class="pin-image" />
        </div>
        <div class="cluster-count">${count}</div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

function MapController({ 
  locations, 
  onMarkerClick 
}: { 
  locations: Location[]
  onMarkerClick: (items: DrawerItem[], isCluster: boolean) => void
}) {
  const map = useMap()
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null)
  const [zoom, setZoom] = useState(map.getZoom())

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
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)

  useEffect(() => {
    setIsClient(true)
    
    // Fetch and parse CSV
    fetch('/data/global_locations_dataset_100_new.csv')
      .then(response => response.text())
      .then(csvText => {
        const lines = csvText.split('\n')
        
        const parsedLocations = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            // Parse CSV line with proper handling of quoted fields
            const values: string[] = []
            let current = ''
            let inQuotes = false
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i]
              
              if (char === '"') {
                inQuotes = !inQuotes
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim())
                current = ''
              } else {
                current += char
              }
            }
            values.push(current.trim())
            
            return {
              location: values[0] || '',
              logical_location: values[1] || '',
              country: values[2] || '',
              spot: values[3] || '',
              latitude: parseFloat(values[4]),
              longitude: parseFloat(values[5]),
              activity: values[6] || '',
              description: values[7] || '',
              price_class: values[8] || '',
              prominence_score: parseInt(values[9]) || 0,
              tags: values[10] || '',
              image_url: values[11] || '',
            }
          })
          .filter(loc => !isNaN(loc.latitude) && !isNaN(loc.longitude) && loc.image_url)
        
        setLocations(parsedLocations)
      })
      .catch(error => console.error('Error loading locations:', error))
  }, [])

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

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStart(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStart === null) return
    const currentY = e.touches[0].clientY
    const diff = currentY - dragStart
    
    // Only allow dragging down
    if (diff > 0) {
      setDragOffset(diff)
    }
  }

  const handleTouchEnd = () => {
    if (dragOffset > 100) {
      // Close if dragged down more than 100px
      closeDrawer()
    } else {
      // Snap back
      setDragOffset(0)
    }
    setDragStart(null)
  }

  if (!isClient) {
    return <div className={className} />
  }

  return (
    <div className={className}>
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
        
        .cluster-pin .pin-image-wrapper {
          border-color: rgba(139, 92, 246, 1);
          border-width: 4px;
        }
        
        .pin-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          min-width: 50px;
          min-height: 50px;
        }
        
        .cluster-count {
          position: absolute;
          bottom: -5px;
          right: -5px;
          background: rgba(139, 92, 246, 1);
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
      
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
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
        
        {locations.length > 0 && <MapController locations={locations} onMarkerClick={handleMarkerClick} />}
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
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Handle bar */}
            <div className="pt-3 pb-2 flex justify-center">
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
            <div className="flex-1 overflow-y-auto">
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
