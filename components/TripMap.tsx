'use client'

import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'
import type { Destination } from '@/lib/generateDestinationInfo'
import type { DayBreakdown } from '@/lib/itineraryHistory'

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



interface TripMapProps {
    locations: Destination[]
    selectedDay: DayBreakdown | null
    className?: string
}

export default function TripMap({ locations, selectedDay, className }: TripMapProps) {
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

    // Logic to determine what to show
    // If selectedDay is active and has valid coords/POIs, show those.
    // Otherwise show the overview of all locations.

    const showDayView = selectedDay && (selectedDay.coordinates || (selectedDay.points_of_interest && selectedDay.points_of_interest.length > 0))

    // Prepare markers for Day View
    const dayMarkers = showDayView ? [
        ...(selectedDay?.coordinates ? [{
            lat: selectedDay.coordinates.lat,
            lng: selectedDay.coordinates.lng,
            title: selectedDay.location,
            subtitle: "Main Location",
            isMain: true
        }] : []),
        ...(selectedDay?.points_of_interest || []).map(poi => ({
            lat: poi.coordinates.lat,
            lng: poi.coordinates.lng,
            title: poi.name,
            subtitle: poi.description,
            isMain: false
        }))
    ] : []

    // Custom Icon Creator
    const createCustomIcon = (type: 'main' | 'poi') => {
        if (!L) return undefined;

        const colorClass = type === 'main' ? 'bg-violet-600' : 'bg-pink-500';

        return L.divIcon({
            className: 'custom-pin',
            html: `
                <div class="relative w-8 h-8 flex items-center justify-center">
                    <div class="w-4 h-4 ${colorClass} rounded-full border-2 border-white shadow-lg relative z-10"></div>
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 ${colorClass} opacity-20 rounded-full animate-ping"></div>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
        });
    }

    // Prepare markers for Overview View (existing logic)
    const validLocations = locations.filter(l => l.coordinates?.lat && l.coordinates?.lng)
    const overviewMarkers = validLocations.map(loc => ({
        lat: loc.coordinates!.lat,
        lng: loc.coordinates!.lng,
        title: loc.region || loc.country,
        subtitle: loc.country,
        isMain: true
    }))

    const markersToShow = showDayView ? dayMarkers : overviewMarkers

    // Helper for center calculation (fallback)
    const getCenter = () => {
        if (markersToShow.length === 0) return [20, 0]
        const lat = markersToShow.reduce((sum, m) => sum + m.lat, 0) / markersToShow.length
        const lng = markersToShow.reduce((sum, m) => sum + m.lng, 0) / markersToShow.length
        return [lat, lng]
    }

    if (markersToShow.length === 0 && !showDayView) {
        return (
            <div className={`flex items-center justify-center bg-violet-50 text-violet-400 ${className}`}>
                <div className="text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No locations to display</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`relative w-full h-full bg-violet-50 ${className}`}>
            <MapContainer
                center={getCenter() as [number, number]}
                zoom={2}
                scrollWheelZoom={true}
                className="w-full h-full z-0"
                style={{ background: 'transparent' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
                    url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
                />

                {markersToShow.map((marker, idx) => (
                    <Marker
                        key={`${marker.title}-${idx}`}
                        position={[marker.lat, marker.lng]}
                        icon={createCustomIcon(marker.isMain ? 'main' : 'poi')}
                    >
                        <Popup>
                            <div className="font-sans">
                                <h3 className="font-bold text-violet-900">{marker.title}</h3>
                                {marker.subtitle && <p className="text-xs text-violet-600">{marker.subtitle}</p>}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    )
}
