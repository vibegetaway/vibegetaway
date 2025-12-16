'use client'

import { useMap } from 'react-leaflet'
import { RotateCcw } from 'lucide-react'

interface MapZoomControlsProps {
    initialZoom: number
}

export function MapZoomControls({ initialZoom }: MapZoomControlsProps) {
    const map = useMap()

    const handleZoomIn = () => {
        const currentZoom = map.getZoom()
        map.flyTo(map.getCenter(), currentZoom + 1, {
            duration: 0.3,
            easeLinearity: 0.25
        })
    }

    const handleZoomOut = () => {
        const currentZoom = map.getZoom()
        map.flyTo(map.getCenter(), Math.max(2, currentZoom - 1), {
            duration: 0.3,
            easeLinearity: 0.25
        })
    }

    const handleRecenter = () => {
        map.flyTo([20, 0], initialZoom, {
            duration: 0.5,
            easeLinearity: 0.25
        })
    }

    return (
        <div className="leaflet-bottom leaflet-right" style={{ zIndex: 1000, pointerEvents: 'auto' }}>
            <div className="flex flex-col gap-2 mb-5 mr-5 pointer-events-auto">
                <button
                    onClick={handleZoomIn}
                    className="w-10 h-10 bg-white hover:bg-gray-50 text-gray-800 rounded-lg shadow-lg flex items-center justify-center font-bold text-xl transition-all hover:scale-105 border-none cursor-pointer"
                    title="Zoom In"
                    type="button"
                >
                    +
                </button>
                <button
                    onClick={handleZoomOut}
                    className="w-10 h-10 bg-white hover:bg-gray-50 text-gray-800 rounded-lg shadow-lg flex items-center justify-center font-bold text-xl transition-all hover:scale-105 border-none cursor-pointer"
                    title="Zoom Out"
                    type="button"
                >
                    −
                </button>
                <button
                    onClick={handleRecenter}
                    className="w-10 h-10 bg-white hover:bg-gray-50 text-gray-800 rounded-lg shadow-lg flex items-center justify-center transition-all hover:scale-105 border-none cursor-pointer"
                    title="Recenter Map"
                    type="button"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
