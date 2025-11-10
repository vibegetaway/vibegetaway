'use client'

import { X } from 'lucide-react'
import type { Destination, UnsplashImage } from '@/lib/generateDestinationInfo'
import { fetchUnsplashImages } from '@/lib/generateDestinationInfo'
import { getCountryName } from '@/lib/countryCodeMapping'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useEffect, useState } from 'react'

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

export function SidePanel({ destination, isOpen, onClose }: SidePanelProps) {
  const [images, setImages] = useState<UnsplashImage[]>([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [coverImage, setCoverImage] = useState<UnsplashImage | null>(null)
  const [loadingCover, setLoadingCover] = useState(false)

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

    if (isOpen && destination) {
      loadCoverImage()
      loadImages()
    }
  }, [destination, isOpen])

  if (!destination) return null

  const accommodationPrice = parsePricing(destination.pricing?.accommodation || 0)
  const foodPrice = parsePricing(destination.pricing?.food || 0)
  const activitiesPrice = parsePricing(destination.pricing?.activities || 0)

  return (
    <>
      {/* Panel - positioned on LEFT side, 1/4 width */}
      <div
        className={`fixed left-0 top-0 h-screen w-full max-w-md bg-stone-50 border-r border-amber-200/50 shadow-2xl z-50 transition-transform duration-300 ease-in-out overflow-y-auto pointer-events-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Cover Image */}
        {loadingCover ? (
          <div className="w-full h-64 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <div className="text-stone-600 text-sm">Loading cover...</div>
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
            <div>
              <h2 className="text-4xl font-bold text-stone-900 mb-2">{getCountryName(destination.country)}</h2>
              <p className="text-stone-600">{destination.region}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-amber-100 rounded-lg transition-colors">
              <X className="w-6 h-6 text-stone-600" />
            </button>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-widest mb-3">About</h3>
            <div className="space-y-3">
              {destination.description?.map((desc, idx) => (
                <div key={idx} className="text-stone-700 leading-relaxed prose prose-sm max-w-none prose-p:my-0 prose-strong:text-stone-900 prose-strong:font-semibold">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{desc}</ReactMarkdown>
                </div>
              ))}
            </div>
          </div>

          {/* Image Gallery */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-widest mb-3">Gallery</h3>
            {loadingImages ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-stone-600 text-sm">Loading images...</div>
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
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200/50">
                <p className="text-xs text-stone-600 mb-1">Accommodation Range</p>
                <p className="text-2xl font-bold text-amber-700">${destination.pricing?.accommodation || 0}/night</p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200/50">
                <p className="text-xs text-stone-600 mb-1">Food & Dining</p>
                <p className="text-2xl font-bold text-yellow-700">${destination.pricing?.food || 0}/day</p>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200/50">
                <p className="text-xs text-stone-600 mb-1">Activities & Entertainment</p>
                <p className="text-2xl font-bold text-orange-700">${destination.pricing?.activities || 0}/day</p>
              </div>
            </div>
          </div>

          {/* Flight Details */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-widest mb-4">Flight Details</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-gradient-to-br from-amber-100/50 to-orange-100/50 border border-amber-300/50">
                <p className="text-xs text-stone-600 mb-2">Outbound Flight</p>
                <p className="text-lg font-semibold text-stone-900 mb-1">DEP 08:30 → ARR 18:45</p>
                <p className="text-sm text-stone-700">Direct Flight • 14h 15m</p>
                <p className="text-sm text-stone-700">Departure: New York (JFK)</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-amber-100/50 to-orange-100/50 border border-amber-300/50">
                <p className="text-xs text-stone-600 mb-2">Return Flight</p>
                <p className="text-lg font-semibold text-stone-900 mb-1">DEP 14:20 → ARR 04:30+1</p>
                <p className="text-sm text-stone-700">Direct Flight • 15h 10m</p>
                <p className="text-sm text-stone-700">Arrival: New York (JFK)</p>
              </div>
              <div className="p-4 rounded-lg bg-stone-100 border border-stone-300/50">
                <p className="text-xs text-stone-600 mb-1">Estimated Flight Cost</p>
                <p className="text-2xl font-bold text-amber-700">$450 - $850</p>
              </div>
            </div>
          </div>

          {/* Trip Summary */}
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

          {/* CTA */}
          <button className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-600 hover:to-orange-500 text-white font-semibold rounded-lg transition-all duration-200">
            Book This Trip
          </button>
        </div>
      </div>
    </>
  )
}

