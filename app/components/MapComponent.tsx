// app/components/MapComponent.tsx
'use client'
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Conditional import to handle SSR issues
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

// Import Leaflet CSS (crucial for map rendering)
import 'leaflet/dist/leaflet.css'

// Import and configure marker icon
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Icon configuration to fix default marker issues
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
})

interface MapComponentProps {
  activities: Array<{
    activity: string
    lat: number
    long: number
    description: string
  }>
}

const MapComponent: React.FC<MapComponentProps> = ({ activities }) => {
  // State to handle client-side rendering
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Default to first location or a global center
  const center = activities.length && activities[0].lat && activities[0].long
    ? [activities[0].lat, activities[0].long]
    : [0, 0]

  // Prevent rendering on server
  if (!mounted) return null

  return (
    <div className="w-full h-full">
      {activities.length > 0 ? (
        <MapContainer 
          center={center as [number, number]} 
          zoom={12} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {activities.map((activity, index) => (
            activity.lat && activity.long ? (
              <Marker 
                key={index} 
                position={[activity.lat, activity.long]}
              >
                <Popup>
                  <strong>{activity.activity}</strong>
                  <p>{activity.description}</p>
                </Popup>
              </Marker>
            ) : null
          ))}
        </MapContainer>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          No locations available
        </div>
      )}
    </div>
  )
}

export default MapComponent