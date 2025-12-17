'use client'

import { X, ArrowRight, CalendarPlus, CalendarCheck } from 'lucide-react'
import type { Destination, UnsplashImage } from '@/lib/generateDestinationInfo'
import { fetchUnsplashImages } from '@/lib/generateDestinationInfo'
import { getCountryName } from '@/lib/countryCodeMapping'
import type { SimplifiedFlight } from '@/lib/getRapidApiFlights'
import { fetchRapidApiFlights } from '@/lib/getRapidApiFlights'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useEffect, useState } from 'react'
import { addToSavedLocations, removeFromSavedLocations, isDestinationSaved } from '@/lib/itinerary'

interface DestinationInfoPanelProps {
  destination: Destination | null
  isOpen: boolean
  onClose: () => void
  isSidebarOpen?: boolean
}

// Helper to format duration from minutes to "Xh Ym" format
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

// Helper to format date/time from ISO string
function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  const hours = date.getHours().toString().padStart(2, '0')
  const mins = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${mins}`
}

// Helper to format date from ISO string (e.g., "Mon, Dec 10")
function formatDate(isoString: string): string {
  const date = new Date(isoString)
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

export function DestinationInfoPanel({ destination, isOpen, onClose, isSidebarOpen = false }: DestinationInfoPanelProps) {
  const [images, setImages] = useState<UnsplashImage[]>([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [coverImage, setCoverImage] = useState<UnsplashImage | null>(null)
  const [loadingCover, setLoadingCover] = useState(false)
  const [flights, setFlights] = useState<SimplifiedFlight[]>([])
  const [loadingFlights, setLoadingFlights] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    async function loadImages() {
      if (destination?.imagesKeywords?.gallery) {
        setLoadingImages(true)
        try {
          const fetchedImages = await fetchUnsplashImages(destination.imagesKeywords.gallery, 10)
          setImages(fetchedImages)
        } catch (error) {
          console.error('Error loading images:', error)
          setImages([])
        } finally {
          setLoadingImages(false)
        }
      } else {
        setImages([])
      }
    }

    async function loadCoverImage() {
      if (destination?.imagesKeywords?.cover) {
        setLoadingCover(true)
        try {
          const fetchedImages = await fetchUnsplashImages(destination.imagesKeywords.cover, 1)
          setCoverImage(fetchedImages[0] || null)
        } catch (error) {
          console.error('Error loading cover image:', error)
          setCoverImage(null)
        } finally {
          setLoadingCover(false)
        }
      } else {
        setCoverImage(null)
      }
    }

    async function loadFlights() {
      setLoadingFlights(true)
      try {
        // Use destination's airport code if available
        const airportCode = destination?.destinationAirportCode
        const fetchedFlights = await fetchRapidApiFlights('City:amsterdam_nl', airportCode)
        setFlights(fetchedFlights)
      } catch (error) {
        console.error('Error loading flights:', error)
        setFlights([])
      } finally {
        setLoadingFlights(false)
      }
    }

    if (isOpen && destination) {
      loadCoverImage()
      loadImages()
      loadFlights()
      setIsSaved(isDestinationSaved(destination))
    }

    const handleLocationsUpdate = () => {
      if (destination) {
        setIsSaved(isDestinationSaved(destination))
      }
    }

    window.addEventListener('locationsUpdated', handleLocationsUpdate)

    return () => {
      window.removeEventListener('locationsUpdated', handleLocationsUpdate)
    }
  }, [destination, isOpen])

  if (!destination) return null

  return (
    <>
      {/* Panel - positioned after SearchResultsPanel */}
      <div
        className={`fixed top-0 h-screen w-[28rem] bg-white/95 backdrop-blur-md border-r border-violet-200 shadow-2xl z-[60] transition-all duration-300 ease-in-out overflow-y-auto pointer-events-auto ${isSidebarOpen ? 'left-[32rem]' : 'left-16'
          } ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Spacer for text input */}
        <div className="h-24"></div>

        {/* Cover Image */}
        {!destination.imagesKeywords || loadingCover ? (
          <div className="w-full h-64 bg-gradient-to-br from-violet-100 to-pink-100 animate-pulse flex items-center justify-center">
            <div className="text-violet-600 text-sm">Loading...</div>
          </div>
        ) : coverImage ? (
          <div className="w-full h-64 relative overflow-hidden">
            <img
              src={coverImage.urls.regular}
              alt={coverImage.altDescription}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-violet-900/60 via-transparent to-transparent" />
          </div>
        ) : null}

        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-violet-900 mb-2">{getCountryName(destination.country)}</h2>
              <p className="text-violet-600">{destination.region}</p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isSaved) {
                    removeFromSavedLocations(destination)
                  } else {
                    addToSavedLocations(destination)
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                  isSaved
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md'
                    : 'bg-violet-500 text-white hover:bg-violet-600 shadow-md'
                }`}
                aria-label={isSaved ? 'Remove from plan' : 'Add to plan'}
              >
                {isSaved ? (
                  <>
                    <CalendarCheck className="w-5 h-5" />
                    <span>In Plan</span>
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-5 h-5" />
                    <span>Add to Plan</span>
                  </>
                )}
              </button>

              <button onClick={onClose} className="p-2 hover:bg-violet-100 rounded-lg transition-colors">
                <X className="w-6 h-6 text-violet-500" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-violet-700 uppercase tracking-widest mb-3">About</h3>
            {destination.description && destination.description.length > 0 ? (
              <div className="space-y-3">
                {destination.description.map((desc, idx) => (
                  <div key={idx} className="text-violet-700 leading-relaxed prose prose-sm max-w-none prose-p:my-0 prose-strong:text-violet-900 prose-strong:font-semibold">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{desc}</ReactMarkdown>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="h-4 bg-violet-100/50 rounded animate-pulse"></div>
                <div className="h-4 bg-violet-100/50 rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-violet-100/50 rounded animate-pulse w-4/6"></div>
                <div className="h-4 bg-violet-100/50 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-violet-100/50 rounded animate-pulse w-3/4"></div>
              </div>
            )}
          </div>

          {/* Image Gallery */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-violet-700 uppercase tracking-widest mb-3">Gallery</h3>
            {!destination.imagesKeywords || loadingImages ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-violet-200/50 bg-violet-50/50 animate-pulse">
                    <div className="w-full h-full bg-violet-100"></div>
                  </div>
                ))}
              </div>
            ) : images.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {images.map((image) => (
                  <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden border border-violet-200/50 hover:border-violet-300 transition-colors">
                    <img
                      src={image.urls.small}
                      alt={image.altDescription}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 bg-violet-100 rounded-lg border border-violet-200">
                <div className="text-violet-500 text-sm">No images available</div>
              </div>
            )}
          </div>

          {/* Pricing Details */}
          {destination.pricing && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-violet-700 uppercase tracking-widest mb-3">Pricing</h3>
              <div className="space-y-2 text-sm text-violet-700">
                <div className="flex justify-between">
                  <span>Accommodation</span>
                  <span className="font-semibold">${destination.pricing.accommodation}/night</span>
                </div>
                <div className="flex justify-between">
                  <span>Food</span>
                  <span className="font-semibold">${destination.pricing.food}/day</span>
                </div>
                <div className="flex justify-between">
                  <span>Activities</span>
                  <span className="font-semibold">${destination.pricing.activities}/day</span>
                </div>
              </div>
            </div>
          )}

          {/* Flight Details */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-violet-700 uppercase tracking-widest mb-4">Available Flights</h3>
            {!destination.destinationAirportCode || loadingFlights ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-5 rounded-lg bg-gradient-to-br from-violet-100/60 to-pink-100/60 border border-violet-300/50 animate-pulse">
                    <div className="h-6 bg-violet-100 rounded mb-3"></div>
                    <div className="h-4 bg-violet-100 rounded mb-2"></div>
                    <div className="h-4 bg-violet-100 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : flights.length > 0 ? (
              <div className="space-y-4">
                {flights.map((flight, index) => {
                  const departureTime = formatDateTime(flight.departure_at)
                  const departureDate = formatDate(flight.departure_at)
                  const returnTime = formatDateTime(flight.return_at)
                  const returnDate = formatDate(flight.return_at)
                  const stayDuration = flight.stayDuration
                  const isDirectFlight = flight.transfers === 0

                  // Badge labels and colors for each flight
                  const badges = [
                    { label: 'Recommended', color: 'bg-violet-600', emoji: '⭐' },
                    { label: 'Popular', color: 'bg-pink-600', emoji: '🔥' },
                    { label: 'May be of interest', color: 'bg-purple-600', emoji: '✨' }
                  ]

                  // Card gradient colors
                  const cardColors = [
                    'from-violet-100/60 to-pink-100/60 border-violet-300/50',
                    'from-pink-100/60 to-purple-100/60 border-pink-300/50',
                    'from-purple-100/60 to-violet-100/60 border-purple-300/50'
                  ]

                  const badge = badges[index]
                  const cardColor = cardColors[index]

                  return (
                    <div key={flight.id} className={`p-5 rounded-lg bg-gradient-to-br ${cardColor} border transition-all hover:shadow-lg`}>
                      {/* Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${badge.color}`}>
                          {badge.emoji} {badge.label}
                        </span>
                        <p className="text-2xl font-bold text-violet-800">€{Math.round(flight.price)}</p>
                      </div>

                      {/* Flight Route - Compact */}
                      <div className="mb-3">
                        <p className="text-base font-semibold text-violet-900">
                          {flight.origin} ↔ {flight.destination}
                        </p>
                        <p className="text-xs text-violet-600 mt-0.5">
                          {flight.originName} ↔ {flight.destinationName}
                        </p>
                      </div>

                      {/* Flight Details - Compact Single Row */}
                      <div className="mb-3 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-violet-700">
                          <span className="font-medium">Outbound:</span>
                          <span>{departureDate} {departureTime} • {formatDuration(flight.outboundDuration)} {flight.outboundTransfers > 0 && `• ${flight.outboundTransfers} Stop${flight.outboundTransfers > 1 ? 's' : ''}`}</span>
                        </div>
                        <div className="flex items-center justify-between text-violet-700">
                          <span className="font-medium">Return:</span>
                          <span>{returnDate} {returnTime} • {formatDuration(flight.inboundDuration)} {flight.inboundTransfers > 0 && `• ${flight.inboundTransfers} Stop${flight.inboundTransfers > 1 ? 's' : ''}`}</span>
                        </div>
                        <div className="flex items-center justify-between text-violet-700 pt-1 border-t border-violet-200/30">
                          <span>Stay:</span>
                          <span className="font-semibold">{stayDuration} {stayDuration === 1 ? 'day' : 'days'}</span>
                        </div>
                      </div>

                      {/* Book Button */}
                      <a
                        href={flight.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <span>Book</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 bg-violet-100 rounded-lg border border-violet-200">
                <div className="text-violet-500 text-sm">No flights available</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

