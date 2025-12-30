import { useState, useEffect } from 'react'

interface UseTypingAnimationOptions {
  phrases: string[]
  enabled?: boolean
  typingSpeed?: number
  deletingSpeed?: number
  pauseTime?: number
  delayBetweenPhrases?: number
}

export function useTypingAnimation({
  phrases,
  enabled = true,
  typingSpeed = 80,
  deletingSpeed = 50,
  pauseTime = 1500,
  delayBetweenPhrases = 500
}: UseTypingAnimationOptions) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("")
  const [isTypingState, setIsTypingState] = useState(true)

  useEffect(() => {
    if (!enabled || phrases.length === 0) {
      setDisplayedPlaceholder("")
      return
    }

    const currentText = phrases[placeholderIndex]
    let currentIndex = 0
    let typingInterval: NodeJS.Timeout

    if (isTypingState) {
      // Typing forward
      typingInterval = setInterval(() => {
        if (currentIndex < currentText.length) {
          setDisplayedPlaceholder(currentText.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          clearInterval(typingInterval)
          // Pause at full text, then start deleting
          setTimeout(() => setIsTypingState(false), pauseTime)
        }
      }, typingSpeed)
    } else {
      // Deleting backward
      currentIndex = currentText.length
      typingInterval = setInterval(() => {
        if (currentIndex > 0) {
          setDisplayedPlaceholder(currentText.slice(0, currentIndex - 1))
          currentIndex--
        } else {
          clearInterval(typingInterval)
          // Move to next placeholder and start typing
          setTimeout(() => {
            setPlaceholderIndex((prev) => (prev + 1) % phrases.length)
            setIsTypingState(true)
          }, delayBetweenPhrases)
        }
      }, deletingSpeed)
    }

    return () => clearInterval(typingInterval)
  }, [enabled, phrases, placeholderIndex, isTypingState, typingSpeed, deletingSpeed, pauseTime, delayBetweenPhrases])

  return displayedPlaceholder
}

