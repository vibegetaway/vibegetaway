'use client'

import { useEffect, useState, useRef } from 'react'
import { Loader2, Sparkles, MapPin, CheckCircle2 } from 'lucide-react'

interface SearchProgressIndicatorProps {
  isLoading: boolean
  destinationCount: number
  isSearchActive: boolean
  onClick?: () => void
}

export function SearchProgressIndicator({
  isLoading,
  destinationCount,
  isSearchActive,
  onClick
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
      setTimeout(() => setShowNewGemAnimation(false), 1000)
    }
    prevCountRef.current = destinationCount
  }, [destinationCount])


  if (!isVisible || !isSearchActive) {
    return null
  }

  return (
    <>
      <style jsx global>{`
        @keyframes sparkleBurst {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: translate(var(--sparkle-x), var(--sparkle-y)) scale(1.2) rotate(180deg);
          }
          100% {
            opacity: 0;
            transform: translate(var(--sparkle-x), var(--sparkle-y)) scale(0.3) rotate(360deg);
          }
        }
        
        .sparkle-burst {
          animation: sparkleBurst 0.8s ease-out forwards;
        }
      `}</style>
      
      <div className="fixed bottom-24 right-4 z-[1001] transition-all duration-500">
        <div className="relative">
          {/* Sparkle burst effect */}
          {showNewGemAnimation && (
            <>
              {/* Outer sparkles - 8 sparkles radiating outward */}
              {[...Array(8)].map((_, i) => {
                const angle = (i * 45) * (Math.PI / 180)
                const distance = 35
                const x = Math.cos(angle) * distance
                const y = Math.sin(angle) * distance
                return (
                  <div
                    key={`outer-${i}`}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sparkle-burst"
                    style={{
                      '--sparkle-x': `${x}px`,
                      '--sparkle-y': `${y}px`,
                      animationDelay: `${i * 0.04}s`
                    } as React.CSSProperties}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-pink-400 drop-shadow-lg" />
                  </div>
                )
              })}
              {/* Inner sparkles - 6 sparkles closer */}
              {[...Array(6)].map((_, i) => {
                const angle = (i * 60) * (Math.PI / 180)
                const distance = 18
                const x = Math.cos(angle) * distance
                const y = Math.sin(angle) * distance
                return (
                  <div
                    key={`inner-${i}`}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sparkle-burst"
                    style={{
                      '--sparkle-x': `${x}px`,
                      '--sparkle-y': `${y}px`,
                      animationDelay: `${i * 0.02}s`
                    } as React.CSSProperties}
                  >
                    <Sparkles className="w-2.5 h-2.5 text-violet-400 drop-shadow-lg" />
                  </div>
                )
              })}
              {/* Center sparkle */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse drop-shadow-lg" />
              </div>
            </>
          )}
          
          <button
            onClick={onClick}
            disabled={isLoading || destinationCount === 0}
            className={`
              relative flex items-center gap-2.5 px-4 py-3 
              bg-white/95 backdrop-blur-md rounded-full 
              shadow-xl border border-gray-200/80
              transition-all duration-300
              ${showNewGemAnimation ? 'scale-110 shadow-2xl shadow-pink-200/50 border-pink-300' : ''}
              ${onClick && !isLoading && destinationCount > 0 ? 'cursor-pointer hover:shadow-2xl hover:scale-105 active:scale-95' : ''}
              ${isLoading || destinationCount === 0 ? 'cursor-default' : ''}
            `}
          >
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
                  {showNewGemAnimation && (
                    <div className="absolute -inset-2 bg-pink-400/30 rounded-full animate-ping" style={{ animationDuration: '0.7s' }} />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className={`w-3.5 h-3.5 text-violet-600 transition-transform duration-300 ${showNewGemAnimation ? 'scale-125 rotate-12' : ''}`} />
                  <span className={`text-sm font-semibold transition-colors duration-300 ${showNewGemAnimation ? 'text-pink-600' : 'text-gray-800'}`}>
                    {destinationCount} {destinationCount === 1 ? 'gem found' : 'gems found'}
                  </span>
                  {showNewGemAnimation && (
                    <Sparkles className="w-4 h-4 text-pink-500 animate-bounce" style={{ animationDuration: '0.4s' }} />
                  )}
                </div>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
