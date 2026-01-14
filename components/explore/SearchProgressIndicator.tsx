'use client'

import { useEffect, useState, useRef } from 'react'
import { Loader2, Sparkles, MapPin, CheckCircle2 } from 'lucide-react'

interface SearchProgressIndicatorProps {
  isLoading: boolean
  destinationCount: number
  isSearchActive: boolean
}

export function SearchProgressIndicator({
  isLoading,
  destinationCount,
  isSearchActive
}: SearchProgressIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showNewGemAnimation, setShowNewGemAnimation] = useState(false)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const prevCountRef = useRef(0)

  useEffect(() => {
    if (isSearchActive && (isLoading || destinationCount > 0)) {
      setIsVisible(true)

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
    } else if (!isSearchActive) {
      setIsVisible(false)
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
    }
  }, [isSearchActive, isLoading, destinationCount])

  useEffect(() => {
    if (destinationCount > prevCountRef.current && destinationCount > 0) {
      setShowNewGemAnimation(true)
      setTimeout(() => setShowNewGemAnimation(false), 600)
    }
    prevCountRef.current = destinationCount
  }, [destinationCount])

  useEffect(() => {
    if (!isLoading && destinationCount > 0 && isSearchActive) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }

      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false)
      }, 3000)
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
    }
  }, [isLoading, destinationCount, isSearchActive])

  useEffect(() => {
    if (isLoading || destinationCount === 0) return

    const handleInteraction = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
      setTimeout(() => {
        setIsVisible(false)
      }, 500)
    }

    const events = ['click', 'touchstart', 'scroll', 'keydown']
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true, passive: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction)
      })
    }
  }, [isLoading, destinationCount])

  if (!isVisible || !isSearchActive) {
    return null
  }

  return (
    <div className="fixed bottom-24 right-4 z-[1001] transition-all duration-500">
      <div className={`
        flex items-center gap-2.5 px-4 py-3 
        bg-white/95 backdrop-blur-md rounded-full 
        shadow-xl border border-gray-200/80
        transition-all duration-300
        ${showNewGemAnimation ? 'scale-105 shadow-2xl shadow-violet-200/50 border-violet-300' : ''}
      `}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
            <span className="text-sm font-medium text-gray-700">
              Discovering gems...
            </span>
          </>
        ) : (
          <>
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-violet-600" />
              <span className="text-sm font-semibold text-gray-800">
                {destinationCount} {destinationCount === 1 ? 'gem found' : 'gems found'}
              </span>
              {showNewGemAnimation && (
                <Sparkles className="w-3 h-3 text-pink-500 animate-pulse" />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
