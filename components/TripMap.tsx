'use client'

import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'
import type { Destination } from '@/lib/generateDestinationInfo'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
)
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
)
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
)
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
)
const useMap = dynamic(
    () => import('react-leaflet').then((mod) => mod.useMap),
    { ssr: false }
)

// Component to update map bounds when locations change
function MapBoundsUpdater({ locations }: { locations: Destination[] }) {
    const map = useMap() as any

    useEffect(() => {
        if (!map || locations.length === 0) return

        import('leaflet').then((L) => {
            // Create bounds from all locations
            const bounds = L.latLngBounds(
                locations.map(loc => [
                    // Safe fallback coordinates if missing
                    loc.coordinates?.latitude || 0,
                    loc.coordinates?.longitude || 0
                ])
            )

            // Pad the bounds so markers aren't on the edge
            map.fitBounds(bounds, { padding: [50, 50] })
        })
    }, [map, locations])

    return null
}

interface TripMapProps {
    locations: Destination[]
    className?: string
}

export default function TripMap({ locations, className }: TripMapProps) {
    const [L, setL] = useState<any>(null)

    useEffect(() => {
        // Import Leaflet client-side only to configure icons
        import('leaflet').then((Leaflet) => {
            setL(Leaflet)

            // Fix default marker icon issues in Next.js/Leaflet
            // @ts-ignore
            delete Leaflet.Icon.Default.prototype._getIconUrl
            Leaflet.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            })
        })
    }, [])

    if (locations.length === 0) {
        return (
            <div className={`flex items-center justify-center bg-violet-50 text-violet-400 ${className}`}>
                <div className="text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No locations to display</p>
                </div>
            </div>
        )
    }

    // Calculate center (average of coords) or default
    const validLocations = locations.filter(l => l.coordinates?.latitude && l.coordinates?.longitude)
    const centerLat = validLocations.reduce((sum, loc) => sum + (loc.coordinates?.latitude || 0), 0) / (validLocations.length || 1)
    const centerLng = validLocations.reduce((sum, loc) => sum + (loc.coordinates?.longitude || 0), 0) / (validLocations.length || 1)

    return (
        <div className={`relative w-full h-full rounded-2xl overflow-hidden shadow-inner border border-violet-100 ${className}`}>
            <MapContainer
                center={[centerLat || 20, centerLng || 0]}
                zoom={2}
                scrollWheelZoom={true}
                className="w-full h-full z-0"
                style={{ background: '#f5f3ff' }} // violet-50
            >
                <TileLayer
                    attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                    url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
                />

                {validLocations.map((loc, idx) => (
                    <Marker
                        key={`${loc.region}-${loc.country}-${idx}`}
                        position={[loc.coordinates?.latitude || 0, loc.coordinates?.longitude || 0]}
                    >
                        <Popup>
                            <div className="font-sans">
                                <h3 className="font-bold text-violet-900">{loc.region || loc.country}</h3>
                                <p className="text-xs text-violet-600">{loc.country}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <MapBoundsUpdater locations={validLocations} />
            </MapContainer>
        </div>
    )
}
