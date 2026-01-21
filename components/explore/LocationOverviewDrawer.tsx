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
                className="fixed inset-0 bg-black/40 z-[10000] transition-opacity"
                onClick={onClose}
                style={{
                    opacity: dragOffset > 0 ? Math.max(0, 1 - dragOffset / 300) : 1
                }}
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[10001] max-h-[85vh] flex flex-col"
                style={{
                    transform: `translateY(${dragOffset}px)`,
                    transition: dragStart === null ? 'transform 0.3s ease-out' : 'none',
                    overscrollBehavior: 'contain',
                }}
            >
                {/* Handle bar */}
                <div className="pt-4 pb-3 flex justify-center flex-shrink-0">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-6 pb-4 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {isClusterView
                            ? `${items.length} Places`
                            : items[0]?.spot
                        }
                    </h2>
                    {!isClusterView && items[0] && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{items[0].location}, {items[0].country}</span>
                        </div>
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

                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                        {item.description}
                                    </p>

                                    {/* Enriched Content Pills */}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {item.price_level && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                {item.price_level}
                                            </span>
                                        )}
                                        {item.highlights && item.highlights.length > 0 && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                {item.highlights.length} Highlights
                                            </span>
                                        )}
                                        {item.activities && item.activities.length > 0 && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                {item.activities.length} Activities
                                            </span>
                                        )}
                                        {item.tips && item.tips.length > 0 && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                                {item.tips.length} Tips
                                            </span>
                                        )}
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
