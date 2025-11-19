'use client'

import { X, ArrowRight, Heart, Calendar } from 'lucide-react'
import type { Destination, UnsplashImage } from '@/lib/generateDestinationInfo'
import { fetchUnsplashImages } from '@/lib/generateDestinationInfo'
import { getCountryName } from '@/lib/countryCodeMapping'
import type { SimplifiedFlight } from '@/lib/getRapidApiFlights'
import { fetchRapidApiFlights } from '@/lib/getRapidApiFlights'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useEffect, useState } from 'react'
import { addToItinerary, isInItinerary } from '@/lib/itinerary'
import { addToFavorites, isInFavorites } from '@/lib/favorites'

interface SidePanelProps {
  destination: Destination | null
  isOpen: boolean
  onClose: () => void
}

// Helper to parse pricing values (e.g., "20-40", "25", or numbers)
function parsePricing(value: string | number): number {
  if (typeof value === 'number') return value
  const strValue = String(value)
  const match = strValue.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 0
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

export function SidePanel({ destination, isOpen, onClose }: SidePanelProps) {
  const [images, setImages] = useState<UnsplashImage[]>([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [coverImage, setCoverImage] = useState<UnsplashImage | null>(null)
  const [loadingCover, setLoadingCover] = useState(false)
  const [flights, setFlights] = useState<SimplifiedFlight[]>([])
  const [loadingFlights, setLoadingFlights] = useState(false)
  const [inItinerary, setInItinerary] = useState(false)
  const [inFavorites, setInFavorites] = useState(false)

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
      
      // Check if destination is in itinerary/favorites
      setInItinerary(isInItinerary(destination))
      setInFavorites(isInFavorites(destination))
    }
    
    // Listen for updates
    const handleItineraryUpdate = () => {
      if (destination) {
        setInItinerary(isInItinerary(destination))
      }
    }
    
    const handleFavoritesUpdate = () => {
      if (destination) {
        setInFavorites(isInFavorites(destination))
      }
    }
    
    window.addEventListener('itineraryUpdated' as any, handleItineraryUpdate)
    window.addEventListener('favoritesUpdated' as any, handleFavoritesUpdate)
    
    return () => {
      window.removeEventListener('itineraryUpdated' as any, handleItineraryUpdate)
      window.removeEventListener('favoritesUpdated' as any, handleFavoritesUpdate)
    }
  }, [destination, isOpen])

  if (!destination) return null

  const accommodationPrice = parsePricing(destination.pricing?.accommodation || 0)
  const foodPrice = parsePricing(destination.pricing?.food || 0)
  const activitiesPrice = parsePricing(destination.pricing?.activities || 0)

  return (
    <>
      {/* Panel - positioned after SearchResultsPanel */}
      <div
        className={`fixed left-[33rem] top-0 h-screen w-full max-w-md bg-stone-50 border-r border-amber-200/50 shadow-2xl z-[60] transition-transform duration-300 ease-in-out overflow-y-auto pointer-events-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Spacer for text input */}
        <div className="h-24"></div>
        
        {/* Cover Image */}
        {!destination.imagesKeywords || loadingCover ? (
          <div className="w-full h-64 bg-gradient-to-br from-amber-100 to-orange-100 animate-pulse flex items-center justify-center">
            <div className="text-stone-600 text-sm">Loading...</div>
          </div>
        ) : coverImage ? (
          <div className="w-full h-64 relative overflow-hidden">
            <img
              src={coverImage.urls.regular}
              alt={coverImage.altDescription}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
          </div>
        ) : null}

        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-stone-900 mb-2">{getCountryName(destination.country)}</h2>
              <p className="text-stone-600">{destination.region}</p>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!inFavorites) {
                    addToFavorites(destination)
                  }
                }}
                className={`p-2 rounded-lg transition-colors ${
                  inFavorites 
                    ? 'bg-red-50' 
                    : 'hover:bg-amber-100'
                }`}
                disabled={inFavorites}
                aria-label={inFavorites ? 'In favorites' : 'Add to favorites'}
              >
                <Heart className={`w-5 h-5 transition-colors ${
                  inFavorites ? 'text-red-500 fill-red-500' : 'text-stone-600'
                }`} />
              </button>
              
              <button
                onClick={() => {
                  if (!inItinerary) {
                    addToItinerary(destination)
                  }
                }}
                className={`p-2 rounded-lg transition-colors ${
                  inItinerary 
                    ? 'bg-green-50' 
                    : 'hover:bg-amber-100'
                }`}
                disabled={inItinerary}
                aria-label={inItinerary ? 'In itinerary' : 'Add to itinerary'}
              >
                <Calendar className={`w-5 h-5 transition-colors ${
                  inItinerary ? 'text-green-600' : 'text-stone-600'
                }`} />
              </button>
              
              <button onClick={onClose} className="p-2 hover:bg-amber-100 rounded-lg transition-colors">
                <X className="w-6 h-6 text-stone-600" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-widest mb-3">About</h3>
            {destination.description && destination.description.length > 0 ? (
              <div className="space-y-3">
                {destination.description.map((desc, idx) => (
                  <div key={idx} className="text-stone-700 leading-relaxed prose prose-sm max-w-none prose-p:my-0 prose-strong:text-stone-900 prose-strong:font-semibold">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{desc}</ReactMarkdown>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="h-4 bg-amber-100/50 rounded animate-pulse"></div>
                <div className="h-4 bg-amber-100/50 rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-amber-100/50 rounded animate-pulse w-4/6"></div>
                <div className="h-4 bg-amber-100/50 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-amber-100/50 rounded animate-pulse w-3/4"></div>
              </div>
            )}
          </div>

          {/* Image Gallery */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-widest mb-3">Gallery</h3>
            {!destination.imagesKeywords || loadingImages ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-amber-200/50 bg-amber-50/50 animate-pulse">
                    <div className="w-full h-full bg-amber-100"></div>
                  </div>
                ))}
              </div>
            ) : images.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {images.map((image) => (
                  <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden border border-amber-200/50 hover:border-amber-300 transition-colors">
                    <img
                      src={image.urls.small}
                      alt={image.altDescription}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 bg-stone-100 rounded-lg border border-stone-200">
                <div className="text-stone-500 text-sm">No images available</div>
              </div>
            )}
          </div>

          {/* Pricing Details */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-widest mb-4">Pricing Details</h3>
            {destination.pricing ? (
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200/50">
                  <p className="text-xs text-stone-600 mb-1">Accommodation Range</p>
                  <p className="text-2xl font-bold text-amber-700">${destination.pricing.accommodation}/night</p>
                </div>
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200/50">
                  <p className="text-xs text-stone-600 mb-1">Food & Dining</p>
                  <p className="text-2xl font-bold text-yellow-700">${destination.pricing.food}/day</p>
                </div>
                <div className="p-4 rounded-lg bg-orange-50 border border-orange-200/50">
                  <p className="text-xs text-stone-600 mb-1">Activities & Entertainment</p>
                  <p className="text-2xl font-bold text-orange-700">${destination.pricing.activities}/day</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-200/50 animate-pulse">
                  <div className="h-3 bg-amber-100 rounded w-2/3 mb-2"></div>
                  <div className="h-8 bg-amber-100 rounded w-1/2"></div>
                </div>
                <div className="p-4 rounded-lg bg-yellow-50/50 border border-yellow-200/50 animate-pulse">
                  <div className="h-3 bg-yellow-100 rounded w-2/3 mb-2"></div>
                  <div className="h-8 bg-yellow-100 rounded w-1/2"></div>
                </div>
                <div className="p-4 rounded-lg bg-orange-50/50 border border-orange-200/50 animate-pulse">
                  <div className="h-3 bg-orange-100 rounded w-2/3 mb-2"></div>
                  <div className="h-8 bg-orange-100 rounded w-1/2"></div>
                </div>
              </div>
            )}
          </div>

          {/* Trip Summary */}
          {destination.pricing ? (
            <div className="mb-8 p-4 rounded-lg bg-gradient-to-r from-amber-100/60 to-orange-100/60 border border-amber-300/50">
              <p className="text-sm font-semibold text-stone-800 mb-3">7-Day Trip Estimate</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-stone-700">
                  <span>Accommodation</span>
                  <span>
                    ${accommodationPrice * 7}/week
                  </span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Food</span>
                  <span>${foodPrice * 7}/week</span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Activities</span>
                  <span>${activitiesPrice * 7}/week</span>
                </div>
                <div className="border-t border-amber-300/50 pt-2 flex justify-between font-semibold text-amber-800">
                  <span>Total</span>
                  <span>
                    ${accommodationPrice * 7 + foodPrice * 7 + activitiesPrice * 7}/week
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Flight Details */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-widest mb-4">Available Flights</h3>
            {!destination.destinationAirportCode || loadingFlights ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-5 rounded-lg bg-gradient-to-br from-amber-100/60 to-orange-100/60 border border-amber-300/50 animate-pulse">
                    <div className="h-6 bg-amber-100 rounded mb-3"></div>
                    <div className="h-4 bg-amber-100 rounded mb-2"></div>
                    <div className="h-4 bg-amber-100 rounded w-3/4"></div>
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
                    { label: 'Recommended', color: 'bg-amber-600', emoji: '⭐' },
                    { label: 'Popular', color: 'bg-yellow-600', emoji: '🔥' },
                    { label: 'May be of interest', color: 'bg-orange-600', emoji: '✨' }
                  ]
                  
                  // Card gradient colors
                  const cardColors = [
                    'from-amber-100/60 to-orange-100/60 border-amber-300/50',
                    'from-yellow-100/60 to-amber-100/60 border-yellow-300/50',
                    'from-orange-100/60 to-red-100/60 border-orange-300/50'
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
                        <p className="text-2xl font-bold text-amber-800">€{Math.round(flight.price)}</p>
                      </div>
                      
                      {/* Flight Route - Compact */}
                      <div className="mb-3">
                        <p className="text-base font-semibold text-stone-900">
                          {flight.origin} ↔ {flight.destination}
                        </p>
                        <p className="text-xs text-stone-600 mt-0.5">
                          {flight.originName} ↔ {flight.destinationName}
                        </p>
                      </div>
                      
                      {/* Flight Details - Compact Single Row */}
                      <div className="mb-3 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-stone-700">
                          <span className="font-medium">Outbound:</span>
                          <span>{departureDate} {departureTime} • {formatDuration(flight.outboundDuration)} {flight.outboundTransfers > 0 && `• ${flight.outboundTransfers} Stop${flight.outboundTransfers > 1 ? 's' : ''}`}</span>
                        </div>
                        <div className="flex items-center justify-between text-stone-700">
                          <span className="font-medium">Return:</span>
                          <span>{returnDate} {returnTime} • {formatDuration(flight.inboundDuration)} {flight.inboundTransfers > 0 && `• ${flight.inboundTransfers} Stop${flight.inboundTransfers > 1 ? 's' : ''}`}</span>
                        </div>
                        <div className="flex items-center justify-between text-stone-700 pt-1 border-t border-amber-200/30">
                          <span>Stay:</span>
                          <span className="font-semibold">{stayDuration} {stayDuration === 1 ? 'day' : 'days'}</span>
                        </div>
                      </div>
                      
                      {/* Book Button */}
                      <a
                        href={flight.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <span>Book</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 bg-stone-100 rounded-lg border border-stone-200">
                <div className="text-stone-500 text-sm">No flights available</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

