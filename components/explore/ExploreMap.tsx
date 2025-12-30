'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useEffect, useState, useMemo } from 'react'
import L from 'leaflet'
import Supercluster from 'supercluster'
import 'leaflet/dist/leaflet.css'

interface Location {
  location: string      // City/area
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

function MapController({ locations }: { locations: Location[] }) {
  const map = useMap()
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null)
  const [zoom, setZoom] = useState(map.getZoom())

  useEffect(() => {
    const updateBounds = () => {
      setBounds(map.getBounds())
      setZoom(map.getZoom())
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
        if (marker.isCluster && marker.topLocation) {
          return (
            <Marker
              key={marker.id}
              position={marker.position}
              icon={createClusterPin(marker.topLocation.image_url, marker.count || 0)}
              eventHandlers={{
                click: () => {
                  map.setView(marker.position, zoom + 2)
                },
              }}
            >
              <Popup>
                <div className="p-0">
                  <img 
                    src={marker.topLocation.image_url} 
                    alt={marker.topLocation.spot}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-bold text-lg mb-1">{marker.topLocation.spot}</h3>
                    <p className="text-sm text-gray-600 mb-2">{marker.topLocation.location}, {marker.topLocation.country}</p>
                    <p className="text-sm mb-2">{marker.topLocation.description}</p>
                    <p className="text-xs text-violet-600 font-semibold mb-2">
                      Top location in cluster of {marker.count}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {marker.topLocation.tags.split(',').map((tag: string, i: number) => (
                        <span 
                          key={i}
                          className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        } else if (marker.location) {
          return (
            <Marker
              key={marker.id}
              position={marker.position}
              icon={createCircularPin(marker.location.image_url)}
            >
              <Popup>
                <div className="p-0">
                  <img 
                    src={marker.location.image_url} 
                    alt={marker.location.spot}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-bold text-lg mb-1">{marker.location.spot}</h3>
                    <p className="text-sm text-gray-600 mb-2">{marker.location.location}, {marker.location.country}</p>
                    <p className="text-sm mb-2">{marker.location.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      {marker.location.tags.split(',').map((tag: string, i: number) => (
                        <span 
                          key={i}
                          className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
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
              country: values[1] || '',
              spot: values[2] || '',
              latitude: parseFloat(values[3]),
              longitude: parseFloat(values[4]),
              activity: values[5] || '',
              description: values[6] || '',
              price_class: values[7] || '',
              prominence_score: parseInt(values[8]) || 0,
              tags: values[9] || '',
              image_url: values[10] || '',
            }
          })
          .filter(loc => !isNaN(loc.latitude) && !isNaN(loc.longitude) && loc.image_url)
        
        setLocations(parsedLocations)
      })
      .catch(error => console.error('Error loading locations:', error))
  }, [])

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
        
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
        }
        
        .leaflet-popup-content {
          margin: 0;
          width: 280px !important;
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
        
        {locations.length > 0 && <MapController locations={locations} />}
      </MapContainer>
    </div>
  )
}
