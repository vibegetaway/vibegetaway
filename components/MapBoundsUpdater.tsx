'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Destination } from '@/lib/generateDestinationInfo'

export default function MapBoundsUpdater({ locations }: { locations: Destination[] }) {
    const map = useMap()

    useEffect(() => {
        if (!map || locations.length === 0) return

        // Create bounds from all locations
        const bounds = L.latLngBounds(
            locations.map(loc => [
                // Safe fallback coordinates if missing
                loc.coordinates?.lat || 0,
                loc.coordinates?.lng || 0
            ])
        )

        // Pad the bounds so markers aren't on the edge
        map.fitBounds(bounds, { padding: [50, 50] })
    }, [map, locations])

    return null
}
