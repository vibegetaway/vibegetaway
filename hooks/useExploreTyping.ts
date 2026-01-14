import { useState, useEffect, useRef } from 'react'

const EXPLORE_PHRASES = [
    "discover hidden waterfalls...",
    "wander through ancient temples...",
    "find tranquility by the sea...",
    "explore vibrant street markets...",
    "chase sunsets on coastal cliffs...",
    "lose yourself in mountain trails...",
    "uncover secret beach coves...",
    "experience local festivals...",
    "seek adventure in the wilderness...",
    "embrace serenity in nature..."
]

interface UseExploreTypingOptions {
    enabled?: boolean
    typingSpeed?: number
    deletingSpeed?: number
    pauseDuration?: number
}

export function useExploreTyping({
    enabled = true,
    typingSpeed = 60,
    deletingSpeed = 35,
    pauseDuration = 1800
}: UseExploreTypingOptions = {}) {
    const [displayText, setDisplayText] = useState('')
    const phraseIndexRef = useRef(0)
    const charIndexRef = useRef(0)
    const isTypingRef = useRef(true)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (!enabled) {
            setDisplayText('')
            return
        }

        const tick = () => {
            const currentPhrase = EXPLORE_PHRASES[phraseIndexRef.current]

            if (isTypingRef.current) {
                if (charIndexRef.current < currentPhrase.length) {
                    charIndexRef.current++
                    setDisplayText(currentPhrase.slice(0, charIndexRef.current))
                    timeoutRef.current = setTimeout(tick, typingSpeed)
                } else {
                    timeoutRef.current = setTimeout(() => {
                        isTypingRef.current = false
                        tick()
                    }, pauseDuration)
                }
            } else {
                if (charIndexRef.current > 0) {
                    charIndexRef.current--
                    setDisplayText(currentPhrase.slice(0, charIndexRef.current))
                    timeoutRef.current = setTimeout(tick, deletingSpeed)
                } else {
                    phraseIndexRef.current = (phraseIndexRef.current + 1) % EXPLORE_PHRASES.length
                    isTypingRef.current = true
                    timeoutRef.current = setTimeout(tick, 300)
                }
            }
        }

        tick()

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [enabled, typingSpeed, deletingSpeed, pauseDuration])

    return displayText
}
