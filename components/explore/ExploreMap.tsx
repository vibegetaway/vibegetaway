'use client'

import { MapContainer, TileLayer } from 'react-leaflet'

interface ExploreMapProps {
  className?: string
}

export default function ExploreMap({ className }: ExploreMapProps) {
  return (
    <div className={className}>
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
      </MapContainer>
    </div>
  )
}
