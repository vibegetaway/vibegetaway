"use client"

import { useState, useCallback, useEffect } from "react"
import { X, Loader2, RefreshCw, Sparkles, ArrowLeft, ArrowRight, ArrowUp, Heart, Star, ThumbsDown } from "lucide-react"
import { SwipeCard, InspirationCard, SwipeDirection } from "./SwipeCard"

interface InspirationModalProps {
  isOpen: boolean
  onClose: () => void
  activity: string
  location: string
  onRegenerateWithPreferences: (liked: InspirationCard[], superliked: InspirationCard[]) => void
}

type SwipeResult = {
  card: InspirationCard
  direction: SwipeDirection
}

export function InspirationModal({
  isOpen,
  onClose,
  activity,
  location,
  onRegenerateWithPreferences,
}: InspirationModalProps) {
  const [cards, setCards] = useState<InspirationCard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [swipeResults, setSwipeResults] = useState<SwipeResult[]>([])
  const [showInstructions, setShowInstructions] = useState(true)
  const [seenActivities, setSeenActivities] = useState<string[]>([])

  const fetchCards = useCallback(async (excludeActivities: string[] = []) => {
    setIsLoading(true)
    setShowResults(false)
    setCurrentIndex(0)
    setSwipeResults([])

    try {
      const response = await fetch('/api/inspiration-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity,
          location,
          excludeActivities,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch inspiration cards')
      }

      const data = await response.json()
      setCards(data.cards || [])
    } catch (error) {
      console.error('Error fetching inspiration cards:', error)
      setCards([])
    } finally {
      setIsLoading(false)
    }
  }, [activity, location])

  useEffect(() => {
    if (isOpen && cards.length === 0 && !isLoading) {
      fetchCards()
    }
  }, [isOpen, cards.length, isLoading, fetchCards])

  useEffect(() => {
    if (!isOpen) {
      setCards([])
      setCurrentIndex(0)
      setShowResults(false)
      setSwipeResults([])
      setSeenActivities([])
    }
  }, [isOpen])

  const handleSwipe = useCallback((direction: SwipeDirection) => {
    if (direction === null || currentIndex >= cards.length) return

    const currentCard = cards[currentIndex]

    setSwipeResults(prev => [...prev, { card: currentCard, direction }])
    setSeenActivities(prev => [...prev, currentCard.title])

    setTimeout(() => {
      const nextIndex = currentIndex + 1
      if (nextIndex >= cards.length) {
        setShowResults(true)
      } else {
        setCurrentIndex(nextIndex)
      }
    }, 100)

    if (showInstructions) {
      setShowInstructions(false)
    }
  }, [currentIndex, cards, showInstructions])

  const handleShowMoreInspirations = () => {
    fetchCards(seenActivities)
  }

  const handleRegenerateWithPreferences = () => {
    const liked = swipeResults
      .filter(r => r.direction === 'right')
      .map(r => r.card)
    const superliked = swipeResults
      .filter(r => r.direction === 'up')
      .map(r => r.card)

    onRegenerateWithPreferences(liked, superliked)
    onClose()
  }

  const likedCount = swipeResults.filter(r => r.direction === 'right').length
  const superlikedCount = swipeResults.filter(r => r.direction === 'up').length
  const dislikedCount = swipeResults.filter(r => r.direction === 'left').length

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md h-[600px] sm:h-[650px]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors z-50"
          aria-label="Close"
        >
          <X className="w-8 h-8" />
        </button>

        {!showResults && cards.length > 0 && (
          <div className="absolute -top-12 left-0 flex items-center gap-2 text-white/70">
            <span className="text-sm font-medium">
              {currentIndex + 1} / {cards.length}
            </span>
            <div className="flex gap-1">
              {cards.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${i < currentIndex ? 'bg-primary' : i === currentIndex ? 'bg-white' : 'bg-white/30'
                    }`}
                />
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-card rounded-3xl">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Finding inspirations...</p>
          </div>
        ) : showResults ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-card to-muted rounded-3xl p-8 text-center">
            <div className="mb-8">
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">
                All Done!
              </h3>
              <p className="text-muted-foreground">
                Here's what you thought:
              </p>
            </div>

            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mb-2 mx-auto">
                  <ThumbsDown className="w-7 h-7 text-red-500" />
                </div>
                <span className="text-2xl font-bold text-foreground">{dislikedCount}</span>
                <p className="text-xs text-muted-foreground">Nope</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mb-2 mx-auto">
                  <Heart className="w-7 h-7 text-green-500" />
                </div>
                <span className="text-2xl font-bold text-foreground">{likedCount}</span>
                <p className="text-xs text-muted-foreground">Liked</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center mb-2 mx-auto">
                  <Star className="w-7 h-7 text-amber-500" />
                </div>
                <span className="text-2xl font-bold text-foreground">{superlikedCount}</span>
                <p className="text-xs text-muted-foreground">Loved</p>
              </div>
            </div>

            <div className="w-full space-y-3">
              <button
                onClick={handleRegenerateWithPreferences}
                disabled={likedCount === 0 && superlikedCount === 0}
                className="w-full py-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Regenerate with Preferences
              </button>
              <button
                onClick={handleShowMoreInspirations}
                className="w-full py-4 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Show More Inspirations
              </button>
            </div>
          </div>
        ) : cards.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-card rounded-3xl p-8 text-center">
            <p className="text-muted-foreground mb-4">No inspirations found</p>
            <button
              onClick={() => fetchCards()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {cards.slice(currentIndex, currentIndex + 3).reverse().map((card, reversedIndex) => {
              const actualIndex = 2 - reversedIndex
              return (
                <SwipeCard
                  key={card.id}
                  card={card}
                  onSwipe={handleSwipe}
                  isTop={actualIndex === 0}
                  index={actualIndex}
                />
              )
            })}

            {showInstructions && currentIndex === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-6 text-white text-center max-w-xs">
                  <p className="text-lg font-semibold mb-4">Swipe to explore!</p>
                  <div className="flex justify-center gap-6 text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <ArrowLeft className="w-6 h-6 text-red-400" />
                      <span>Nope</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <ArrowUp className="w-6 h-6 text-amber-400" />
                      <span>Love it!</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <ArrowRight className="w-6 h-6 text-green-400" />
                      <span>Like</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/60 mt-4">
                    Or use the buttons below
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

