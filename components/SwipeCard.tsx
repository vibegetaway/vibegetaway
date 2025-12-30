"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Heart, X, Star, MapPin } from "lucide-react"

export interface InspirationCard {
  id: string
  title: string
  location: string
  description: string
  category: 'adventure' | 'culture' | 'food' | 'relaxation' | 'nightlife'
  imageKeywords: string
  imageUrl?: string
}

export type SwipeDirection = 'left' | 'right' | 'up' | null

interface SwipeCardProps {
  card: InspirationCard
  onSwipe: (direction: SwipeDirection) => void
  isTop: boolean
  index: number
}

const SWIPE_THRESHOLD = 100
const SWIPE_UP_THRESHOLD = 80

const categoryColors: Record<InspirationCard['category'], string> = {
  adventure: 'bg-orange-500',
  culture: 'bg-purple-500',
  food: 'bg-amber-500',
  relaxation: 'bg-teal-500',
  nightlife: 'bg-pink-500',
}

const categoryEmojis: Record<InspirationCard['category'], string> = {
  adventure: '🏔️',
  culture: '🏛️',
  food: '🍜',
  relaxation: '🧘',
  nightlife: '🌙',
}

export function SwipeCard({ card, onSwipe, isTop, index }: SwipeCardProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0 })

  const getSwipeDirection = useCallback((x: number, y: number): SwipeDirection => {
    if (y < -SWIPE_UP_THRESHOLD && Math.abs(y) > Math.abs(x)) {
      return 'up'
    }
    if (x > SWIPE_THRESHOLD) return 'right'
    if (x < -SWIPE_THRESHOLD) return 'left'
    return null
  }, [])

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (!isTop) return
    setIsDragging(true)
    startPos.current = { x: clientX, y: clientY }
  }, [isTop])

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !isTop) return
    const deltaX = clientX - startPos.current.x
    const deltaY = clientY - startPos.current.y
    setPosition({ x: deltaX, y: deltaY })
    setSwipeDirection(getSwipeDirection(deltaX, deltaY))
  }, [isDragging, isTop, getSwipeDirection])

  const handleDragEnd = useCallback(() => {
    if (!isDragging || !isTop) return
    setIsDragging(false)

    const direction = getSwipeDirection(position.x, position.y)
    
    if (direction) {
      setIsLeaving(true)
      const exitX = direction === 'right' ? 500 : direction === 'left' ? -500 : 0
      const exitY = direction === 'up' ? -500 : 0
      setPosition({ x: exitX, y: exitY })
      
      setTimeout(() => {
        onSwipe(direction)
      }, 300)
    } else {
      setPosition({ x: 0, y: 0 })
      setSwipeDirection(null)
    }
  }, [isDragging, isTop, position, getSwipeDirection, onSwipe])

  const handleButtonSwipe = useCallback((direction: SwipeDirection) => {
    if (!isTop || direction === null) return
    setIsLeaving(true)
    setSwipeDirection(direction)
    const exitX = direction === 'right' ? 500 : direction === 'left' ? -500 : 0
    const exitY = direction === 'up' ? -500 : 0
    setPosition({ x: exitX, y: exitY })
    
    setTimeout(() => {
      onSwipe(direction)
    }, 300)
  }, [isTop, onSwipe])

  useEffect(() => {
    if (!isTop) return

    const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY)
    const handleMouseUp = () => handleDragEnd()
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }
    const handleTouchEnd = () => handleDragEnd()

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: true })
      window.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, isTop, handleDragMove, handleDragEnd])

  const rotation = position.x * 0.1
  const scale = isTop ? 1 : 1 - index * 0.05
  const yOffset = isTop ? 0 : index * 8

  const getOverlayOpacity = () => {
    if (!swipeDirection) return 0
    const maxOpacity = 0.8
    if (swipeDirection === 'up') {
      return Math.min(Math.abs(position.y) / 150, maxOpacity)
    }
    return Math.min(Math.abs(position.x) / 200, maxOpacity)
  }

  const overlayOpacity = getOverlayOpacity()

  return (
    <div
      ref={cardRef}
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
      style={{
        transform: `translateX(${position.x}px) translateY(${position.y + yOffset}px) rotate(${rotation}deg) scale(${scale})`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        zIndex: 10 - index,
        opacity: isLeaving ? 0.8 : 1,
      }}
      onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
      onTouchStart={(e) => {
        if (e.touches.length > 0) {
          handleDragStart(e.touches[0].clientX, e.touches[0].clientY)
        }
      }}
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-card border border-border">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: card.imageUrl 
              ? `url(${card.imageUrl})` 
              : `linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)`,
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {swipeDirection === 'left' && (
          <div 
            className="absolute inset-0 bg-red-500/50 flex items-center justify-center"
            style={{ opacity: overlayOpacity }}
          >
            <div className="p-6 rounded-full bg-red-500 border-4 border-white">
              <X className="w-16 h-16 text-white" />
            </div>
          </div>
        )}

        {swipeDirection === 'right' && (
          <div 
            className="absolute inset-0 bg-green-500/50 flex items-center justify-center"
            style={{ opacity: overlayOpacity }}
          >
            <div className="p-6 rounded-full bg-green-500 border-4 border-white">
              <Heart className="w-16 h-16 text-white fill-white" />
            </div>
          </div>
        )}

        {swipeDirection === 'up' && (
          <div 
            className="absolute inset-0 bg-amber-500/50 flex items-center justify-center"
            style={{ opacity: overlayOpacity }}
          >
            <div className="p-6 rounded-full bg-amber-500 border-4 border-white">
              <Star className="w-16 h-16 text-white fill-white" />
            </div>
          </div>
        )}

        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-white ${categoryColors[card.category]}`}>
            {categoryEmojis[card.category]} {card.category}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-2xl sm:text-3xl font-bold mb-2 drop-shadow-lg">
            {card.title}
          </h3>
          <div className="flex items-center gap-1.5 mb-3">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium opacity-90">{card.location}</span>
          </div>
          <p className="text-sm sm:text-base opacity-90 leading-relaxed line-clamp-3">
            {card.description}
          </p>
        </div>

        {isTop && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 pt-4">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleButtonSwipe('left')
              }}
              className="p-4 rounded-full bg-white/20 backdrop-blur-sm border-2 border-red-400 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all hover:scale-110"
              aria-label="Dislike"
            >
              <X className="w-7 h-7" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleButtonSwipe('up')
              }}
              className="p-4 rounded-full bg-white/20 backdrop-blur-sm border-2 border-amber-400 text-amber-400 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all hover:scale-110"
              aria-label="Superlike"
            >
              <Star className="w-7 h-7" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleButtonSwipe('right')
              }}
              className="p-4 rounded-full bg-white/20 backdrop-blur-sm border-2 border-green-400 text-green-400 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all hover:scale-110"
              aria-label="Like"
            >
              <Heart className="w-7 h-7" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

