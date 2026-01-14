'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Calendar, MapPin, Navigation, Info, Zap, Map as MapIcon, Star } from 'lucide-react'
import type { DrawerItem } from './ExploreMap'

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
    const [activeTab, setActiveTab] = useState<'info' | 'activities' | 'tips'>('info')

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

                        {/* 1. Relevance Card (Match Reason) */}
                        {location.match_reason && (
                            <div className="bg-gradient-to-br from-violet-50 to-pink-50 border border-violet-100 rounded-2xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-violet-100 rounded-lg">
                                        <Zap className="w-4 h-4 text-violet-600" />
                                    </div>
                                    <h3 className="text-sm font-bold text-violet-900 uppercase tracking-wider">Why it matches</h3>
                                </div>
                                <p className="text-violet-800 text-sm leading-relaxed font-medium">
                                    {location.match_reason}
                                </p>
                            </div>
                        )}

                        {/* 2. Key Insights Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Best Time</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                                    {location.best_time_to_visit || "Year-round"}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Star className="w-4 h-4 text-amber-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Vibe Level</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900">
                                    {location.prominence_score}/10 Prominence
                                </p>
                            </div>
                        </div>

                        {/* 3. Accessibility / Flight Info */}
                        {location.travel_from_origin && (
                            <div className="flex items-center gap-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
                                <div className="p-2 bg-emerald-100 rounded-xl">
                                    <Navigation className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">From your origin</h4>
                                    <p className="text-sm font-medium text-emerald-900">{location.travel_from_origin}</p>
                                </div>
                            </div>
                        )}

                        {/* 4. Tabs for deeper info */}
                        <div className="space-y-6">
                            <div className="flex border-b border-gray-100">
                                {(['info', 'activities', 'tips'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 pb-3 text-sm font-bold transition-colors relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        {activeTab === tab && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {activeTab === 'info' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <Info className="w-5 h-5 text-gray-400" />
                                                About {location.spot}
                                            </h3>
                                            <div className="text-gray-600 text-sm leading-relaxed space-y-4">
                                                {location.extended_description ? (
                                                    location.extended_description.split('\n').map((para, i) => (
                                                        <p key={i}>{para}</p>
                                                    ))
                                                ) : (
                                                    <p>{location.description}</p>
                                                )}
                                            </div>
                                        </div>

                                        {location.why_now && (
                                            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                                                <h4 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                                                    <Zap className="w-4 h-4" />
                                                    Timing Insight
                                                </h4>
                                                <p className="text-sm text-amber-800 leading-relaxed font-medium">
                                                    {location.why_now}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'activities' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <Zap className="w-5 h-5 text-yellow-500" />
                                                Top Things to Do
                                            </h3>
                                            <div className="grid gap-3">
                                                {location.top_activities?.map((activity, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="w-6 h-6 flex-shrink-0 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400 border border-gray-100">
                                                            {i + 1}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700">{activity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {location.nearby_attractions && (
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                    <MapIcon className="w-5 h-5 text-pink-500" />
                                                    Nearby Attractions
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {location.nearby_attractions.map((place, i) => (
                                                        <span key={i} className="bg-pink-50 text-pink-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-pink-100">
                                                            {place}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'tips' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <Info className="w-5 h-5 text-blue-500" />
                                                Practical Tips
                                            </h3>
                                            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
                                                <p className="text-sm text-blue-900 leading-relaxed font-medium">
                                                    {location.practical_tips || "Stay tuned for local tips from Reddit travelers!"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Gallery Placeholder / Info */}
                        <div className="pt-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Experience the Vibe</h3>
                                <span className="text-xs font-medium text-gray-400">Photos via Unsplash</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
                                <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
                            </div>
                        </div>
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
