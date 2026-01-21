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
                {/* Drag Handle Area & Header */}
                <div className="relative flex-shrink-0 bg-white z-20 drag-handle-area">
                    {/* Drag Bar */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-200 rounded-full" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-gray-100/50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors z-30"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrolling Content */}
                <div ref={contentRef} className="flex-1 overflow-y-auto pt-8">
                    {/* Image Gallery Grid */}
                    <div className="px-0 pb-6">
                        <PixabayGallery
                            keywords={location.image_keywords || `${location.spot} ${location.location}`}
                            imageCount={8}
                        />
                    </div>

                    <div className="px-6 pb-24 space-y-8">
                        {/* Title Section */}
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-gray-900">{location.spot}</h1>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-gray-500 text-sm">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span>{location.location}, {location.country}</span>
                                </div>
                                {location.price_level && (
                                    <div className="px-2 py-0.5 bg-green-50 text-green-700 rounded-md font-medium text-xs border border-green-100">
                                        {location.price_level}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <p className="text-gray-600 leading-relaxed text-base">
                                {location.description}
                            </p>
                        </div>

                        {/* Social Proof Quote */}
                        {location.social_proof && (
                            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-5">
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        <svg className="w-6 h-6 text-violet-400 fill-current opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z"></path></svg>
                                    </div>
                                    <div>
                                        <p className="text-gray-700 italic font-medium mb-2">"{location.social_proof.quote}"</p>
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">— via {location.social_proof.source}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Highlights */}
                        {location.highlights && location.highlights.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-gray-400" />
                                    Highlights
                                </h3>
                                <ul className="grid gap-2">
                                    {location.highlights.map((point, i) => (
                                        <li key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                                            <span className="text-violet-600 font-bold">•</span>
                                            <span className="text-gray-700 text-sm">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Activities */}
                        {location.activities && location.activities.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                    Things to Do
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {location.activities.map((activity, i) => (
                                        <div key={i} className="px-3 py-2 bg-white border border-gray-100 shadow-sm rounded-lg text-sm text-gray-600">
                                            {activity}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tips */}
                        {location.tips && location.tips.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-amber-500" />
                                    Local Tips
                                </h3>
                                <ul className="space-y-3">
                                    {location.tips.map((tip, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-gray-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                                            <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-gray-100 flex-shrink-0 bg-white bg-opacity-90 backdrop-blur-md absolute bottom-0 left-0 right-0 z-10">
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
