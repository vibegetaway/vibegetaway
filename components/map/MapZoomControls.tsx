'use client'

import { useMap } from 'react-leaflet'

export function MapZoomControls() {
    const map = useMap()

    const handleZoomIn = () => {
        map.zoomIn()
    }

    const handleZoomOut = () => {
        map.zoomOut()
    }

    const handleRecenter = () => {
        map.setView([20, 0], 2)
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
                    className="w-10 h-10 bg-white hover:bg-gray-50 text-gray-800 rounded-lg shadow-lg flex items-center justify-center font-bold text-base transition-all hover:scale-105 border-none cursor-pointer"
                    title="Recenter Map"
                    type="button"
                >
                    ⟲
                </button>
            </div>
        </div>
    )
}
