'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Calendar, MapPin, Navigation, Info, Zap, Map as MapIcon, Star } from 'lucide-react'
import type { DrawerItem } from './ExploreMap'
import PixabayGallery from './PixabayGallery'

interface LocationDetailsDrawerProps {
    isOpen: boolean
    location: DrawerItem | null
    onClose: () => void
}

export function LocationDetailsDrawer({
    isOpen,
    location,
    onClose
}: LocationDetailsDrawerProps) {
    const drawerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)

    const [dragOffset, setDragOffset] = useState(0)
    const [dragStart, setDragStart] = useState<number | null>(null)

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            return () => {
                document.body.style.overflow = ''
            }
        }
    }, [isOpen])

    // Snap back or close on touch end
    useEffect(() => {
        const drawer = drawerRef.current
        if (!drawer || !isOpen) return

        let localDragStart: number | null = null
        let localDragOffset = 0

        const handleTouchStart = (e: TouchEvent) => {
            // Only allow dragging from header/cover area
            const target = e.target as HTMLElement
            if (target.closest('.drag-handle-area')) {
                localDragStart = e.touches[0].clientY
                setDragStart(localDragStart)
            }
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (localDragStart === null) return
            const currentY = e.touches[0].clientY
            const diff = currentY - localDragStart

            if (diff > 0) {
                e.preventDefault()
                localDragOffset = diff
                setDragOffset(diff)
            }
        }

        const handleTouchEnd = () => {
            if (localDragOffset > 150) {
                onClose()
            } else {
                setDragOffset(0)
            }
            localDragStart = null
            localDragOffset = 0
            setDragStart(null)
        }

        drawer.addEventListener('touchstart', handleTouchStart, { passive: false })
        drawer.addEventListener('touchmove', handleTouchMove, { passive: false })
        drawer.addEventListener('touchend', handleTouchEnd)

        return () => {
            drawer.removeEventListener('touchstart', handleTouchStart)
            drawer.removeEventListener('touchmove', handleTouchMove)
            drawer.removeEventListener('touchend', handleTouchEnd)
        }
    }, [isOpen, onClose])

    if (!isOpen || !location) return null

    return (
        <>
            <div
                className="fixed inset-0 bg-black/60 z-[10000] transition-opacity duration-300"
                onClick={onClose}
                style={{ opacity: isOpen ? (dragOffset > 0 ? Math.max(0, 1 - dragOffset / 400) : 1) : 0 }}
            />

            <div
                ref={drawerRef}
                className="fixed inset-x-0 bottom-0 top-[40px] md:top-[60px] md:max-w-2xl md:mx-auto bg-white rounded-t-[32px] shadow-2xl z-[10001] flex flex-col transition-transform duration-300 ease-out overflow-hidden"
                style={{
                    transform: `translateY(${dragOffset}px)`,
                    transition: dragStart === null ? 'transform 0.3s ease-out' : 'none',
                }}
            >
                {/* Cover Image & Header Area */}
                <div className="relative h-[250px] flex-shrink-0 drag-handle-area cursor-grab active:cursor-grabbing">
                    <img
                        src={location.image_url}
                        alt={location.spot}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Drag Handle */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/30 rounded-full" />

                    {/* Title Overlay */}
                    <div className="absolute bottom-6 left-6 right-6">
                        <h1 className="text-2xl font-bold text-white mb-1">{location.spot}</h1>
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{location.location}, {location.country}</span>
                        </div>
                    </div>
                </div>

                {/* Scrolling Content */}
                <div ref={contentRef} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-8">





                        {/* About Section */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-gray-400" />
                                    About {location.spot}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {location.description}
                                </p>
                            </div>
                        </div>

                        {/* Pixabay Gallery */}
                        {location.image_keywords && (
                            <div className="pt-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Experience the Vibe</h3>
                                    <span className="text-xs font-medium text-gray-400">Photos via Pixabay</span>
                                </div>
                                <PixabayGallery keywords={location.image_keywords} imageCount={6} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-gray-100 flex-shrink-0">
                    <button
                        className="w-full py-4 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold rounded-2xl shadow-xl shadow-violet-200 active:scale-[0.98] transition-all"
                    >
                        Add to My Plan
                    </button>
                </div>
            </div>
        </>
    )
}
