'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { DrawerItem } from './ExploreMap'

interface LocationOverviewDrawerProps {
    isOpen: boolean
    items: DrawerItem[]
    isClusterView: boolean
    onClose: () => void
    onItemClick: (item: DrawerItem) => void
}

const getStarsFromProminence = (score: number): number => {
    return score / 2
}

export function LocationOverviewDrawer({
    isOpen,
    items,
    isClusterView,
    onClose,
    onItemClick
}: LocationOverviewDrawerProps) {
    const drawerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)

    const [dragOffset, setDragOffset] = useState(0)
    const [dragStart, setDragStart] = useState<number | null>(null)
    const [canDragDrawer, setCanDragDrawer] = useState(false)

    // Prevent body scroll and pull-to-refresh when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            document.body.style.overscrollBehavior = 'none'
            return () => {
                document.body.style.overflow = ''
                document.body.style.overscrollBehavior = ''
            }
        }
    }, [isOpen])

    // Snap back or close on touch end
    useEffect(() => {
        const drawer = drawerRef.current
        if (!drawer || !isOpen) return

        let localDragStart: number | null = null
        let localCanDragDrawer = false
        let localDragOffset = 0

        const handleTouchStart = (e: TouchEvent) => {
            const startY = e.touches[0].clientY
            localDragStart = startY
            setDragStart(startY)

            const content = contentRef.current
            if (content) {
                const isAtTop = content.scrollTop === 0
                localCanDragDrawer = isAtTop
                setCanDragDrawer(isAtTop)
            }
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (localDragStart === null) return
            const currentY = e.touches[0].clientY
            const diff = currentY - localDragStart

            const content = contentRef.current
            const isAtTop = content ? content.scrollTop === 0 : false

            if (diff > 0 && localCanDragDrawer && isAtTop) {
                e.preventDefault()
                localDragOffset = diff
                setDragOffset(diff)
            } else if (diff < 0) {
                localDragOffset = 0
                setDragOffset(0)
            }
        }

        const handleTouchEnd = () => {
            if (localDragOffset > 100) {
                onClose()
            } else {
                setDragOffset(0)
            }
            localDragStart = null
            localCanDragDrawer = false
            localDragOffset = 0
            setDragStart(null)
            setCanDragDrawer(false)
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

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 z-[9998] transition-opacity"
                onClick={onClose}
                style={{
                    opacity: dragOffset > 0 ? Math.max(0, 1 - dragOffset / 300) : 1
                }}
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className="fixed bottom-[84px] md:bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[9999] max-h-[80vh] flex flex-col"
                style={{
                    transform: `translateY(${dragOffset}px)`,
                    transition: dragStart === null ? 'transform 0.3s ease-out' : 'none',
                    overscrollBehavior: 'contain',
                }}
            >
                {/* Handle bar */}
                <div className="pt-3 pb-2 flex justify-center">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-5 pb-3 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        {isClusterView
                            ? `${items.length} Places`
                            : items[0]?.spot
                        }
                    </h2>
                    {!isClusterView && items[0] && (
                        <p className="text-sm text-gray-500">
                            {items[0].location}, {items[0].country}
                        </p>
                    )}
                </div>

                {/* Content */}
                <div
                    ref={contentRef}
                    className="flex-1 overflow-y-auto"
                    style={{ overscrollBehavior: 'contain' }}
                >
                    {items.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => onItemClick(item)}
                            className="w-full border-b border-gray-100 last:border-b-0 text-left hover:bg-gray-50 transition-colors"
                        >
                            <div className="p-4 flex gap-3">
                                {/* Image */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={item.image_url}
                                        alt={item.spot}
                                        className="w-24 h-24 object-cover rounded-xl"
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-base text-gray-900 mb-0.5 line-clamp-1">
                                            {item.spot}
                                        </h3>
                                        <ChevronRight className="w-5 h-5 text-gray-400 mt-0.5" />
                                    </div>

                                    <p className="text-xs text-gray-500 mb-1.5">
                                        {item.location}, {item.country}
                                    </p>

                                    {item.match_reason && (
                                        <div className="bg-violet-50 text-violet-700 text-[11px] px-2 py-1 rounded-md mb-2 font-medium line-clamp-1">
                                            ✨ {item.match_reason}
                                        </div>
                                    )}

                                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="flex items-center gap-0.5 text-yellow-500">
                                            {(() => {
                                                const rating = getStarsFromProminence(item.prominence_score)
                                                const fullStars = Math.floor(rating)
                                                const hasHalfStar = rating % 1 !== 0
                                                const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

                                                return (
                                                    <>
                                                        {'★'.repeat(fullStars)}
                                                        {hasHalfStar && <span className="relative inline-block">
                                                            <span className="text-gray-300">★</span>
                                                            <span className="absolute left-0 top-0 overflow-hidden" style={{ width: '50%' }}>★</span>
                                                        </span>}
                                                        <span className="text-gray-300">
                                                            {'★'.repeat(emptyStars)}
                                                        </span>
                                                    </>
                                                )
                                            })()}
                                        </span>
                                        <span className="text-gray-300">•</span>
                                        <span className="font-medium">{item.price_class}</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </>
    )
}
