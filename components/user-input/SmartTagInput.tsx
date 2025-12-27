"use client"

import { useState, useEffect, useRef, KeyboardEvent } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SmartTagInputProps {
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
    suggestionType?: 'vibe' | 'event' | 'exclusion' | 'location'
    className?: string
    autoFocus?: boolean
    onEnter?: () => void
    onInputChange?: (value: string) => void
    onFocus?: () => void
    onBlur?: () => void
    isFocused?: boolean
}

// Example placeholders for cycling animation
const PLACEHOLDER_EXAMPLES = [
    "find inner peace...",
    "explore hidden beaches...",
    "discover ancient ruins...",
    "enjoy street food tours...",
    "experience local festivals...",
    "relax in hot springs...",
    "hike mountain trails...",
    "visit art galleries...",
    "sail coastal waters..."
]

export function SmartTagInput({
    value,
    onChange,
    placeholder,
    suggestionType = 'vibe',
    className,
    autoFocus,
    onEnter,
    onInputChange,
    onFocus,
    onBlur,
    isFocused = false
}: SmartTagInputProps) {
    const [inputValue, setInputValue] = useState("")
    const [suggestion, setSuggestion] = useState("")
    const [lastFullSuggestion, setLastFullSuggestion] = useState("")
    const [placeholderIndex, setPlaceholderIndex] = useState(0)
    const [displayedPlaceholder, setDisplayedPlaceholder] = useState("")
    const [isTyping, setIsTyping] = useState(true)
    const inputRef = useRef<HTMLInputElement>(null)

    // Typing animation for placeholder
    useEffect(() => {
        if (value.length > 0 || inputValue) {
            setDisplayedPlaceholder("")
            return
        }

        const currentText = placeholder || PLACEHOLDER_EXAMPLES[placeholderIndex]
        let currentIndex = 0
        let typingInterval: NodeJS.Timeout

        if (isTyping) {
            // Typing forward
            typingInterval = setInterval(() => {
                if (currentIndex < currentText.length) {
                    setDisplayedPlaceholder(currentText.slice(0, currentIndex + 1))
                    currentIndex++
                } else {
                    clearInterval(typingInterval)
                    // Pause at full text, then start deleting
                    setTimeout(() => setIsTyping(false), 1500)
                }
            }, 80) // Type speed
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
                        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length)
                        setIsTyping(true)
                    }, 500)
                }
            }, 50) // Delete speed (faster than typing)
        }

        return () => clearInterval(typingInterval)
    }, [value.length, inputValue, placeholderIndex, isTyping, placeholder])

    // Fetch suggestions with debounce, but prefer local sticky match
    useEffect(() => {
        // If we have a previous suggestion that still matches the current input, use it!
        if (lastFullSuggestion && lastFullSuggestion.startsWith(inputValue) && inputValue.length > 0) {
            setSuggestion(lastFullSuggestion.slice(inputValue.length))
            return
        }

        // Otherwise, clear suggestion and fetch new one
        if (!inputValue || inputValue.length < 2) {
            setSuggestion("")
            setLastFullSuggestion("")
            return
        }

        const fetchSuggestion = async () => {
            try {
                const res = await fetch("/api/suggestions", {
                    method: "POST",
                    body: JSON.stringify({
                        input: inputValue,
                        context: value.join(", "),
                        type: suggestionType
                    }),
                })

                if (res.ok) {
                    const data = await res.json()
                    if (data.suggestion) {
                        const fullSuggestion = inputValue + data.suggestion
                        setLastFullSuggestion(fullSuggestion)
                        setSuggestion(data.suggestion)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch suggestion", error)
            }
        }

        const timeoutId = setTimeout(fetchSuggestion, 300)
        return () => clearTimeout(timeoutId)
    }, [inputValue, value, lastFullSuggestion, suggestionType])

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowRight" && suggestion) {
            // Right Arrow accepts the autocomplete suggestion
            e.preventDefault()
            setInputValue(inputValue + suggestion)
            setSuggestion("")
        } else if (e.key === "Tab" || e.key === ",") {
            // Tab adds the current input as a new tag
            e.preventDefault()
            const textToAdd = inputValue

            if (textToAdd.trim()) {
                if (!value.includes(textToAdd.trim())) {
                    onChange([...value, textToAdd.trim()])
                }
                setInputValue("")
                setSuggestion("")
                setLastFullSuggestion("")
            }
        } else if (e.key === "Enter") {
            e.preventDefault()
            const textToAdd = inputValue

            // Add the current input as a tag (if not empty)
            if (textToAdd.trim()) {
                if (!value.includes(textToAdd.trim())) {
                    onChange([...value, textToAdd.trim()])
                }
                setInputValue("")
                setSuggestion("")
                setLastFullSuggestion("")
            }
            
            // Trigger search if onEnter callback is provided
            if (onEnter) {
                onEnter()
            }
            
            // Blur to collapse
            inputRef.current?.blur()
        } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
            onChange(value.slice(0, -1))
        }
    }

    const removeTag = (indexToRemove: number) => {
        onChange(value.filter((_, index) => index !== indexToRemove))
        inputRef.current?.focus()
    }

    const visibleTagsCount = isFocused ? value.length : Math.min(2, value.length)
    const hiddenTagsCount = value.length - visibleTagsCount
    const visibleTags = value.slice(0, visibleTagsCount)

    return (
        <div
            className={cn(
                "relative flex gap-2 p-2 bg-white border border-violet-200 rounded-lg focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-100 transition-all duration-300 ease-in-out cursor-text",
                isFocused 
                    ? "flex-wrap items-start max-h-none" 
                    : "flex-nowrap items-center max-h-[32px]",
                className
            )}
            onClick={() => inputRef.current?.focus()}
        >
            {visibleTags.map((tag, index) => (
                <span
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-violet-100 text-violet-700 rounded-md text-sm animate-in fade-in zoom-in duration-200 whitespace-nowrap shrink-0"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            removeTag(index)
                        }}
                        className="hover:text-violet-900 focus:outline-none"
                        aria-label={`Remove ${tag}`}
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            ))}
            {!isFocused && hiddenTagsCount > 0 && (
                <span className="flex items-center px-2 py-1 bg-violet-50 text-violet-600 rounded-md text-sm whitespace-nowrap shrink-0 font-medium">
                    +{hiddenTagsCount} more
                </span>
            )}
            {isFocused && value.slice(visibleTagsCount).map((tag, index) => (
                <span
                    key={visibleTagsCount + index}
                    className="flex items-center gap-1 px-2 py-1 bg-violet-100 text-violet-700 rounded-md text-sm animate-in fade-in zoom-in duration-200 whitespace-nowrap shrink-0"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            removeTag(visibleTagsCount + index)
                        }}
                        className="hover:text-violet-900 focus:outline-none"
                        aria-label={`Remove ${tag}`}
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            ))}

            <div className="relative flex-1 min-w-[120px]">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value)
                        setSuggestion("")
                        onInputChange?.(e.target.value)
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => onFocus?.()}
                    onBlur={() => onBlur?.()}
                    className="w-full bg-transparent outline-none text-stone-800"
                    placeholder=""
                    autoFocus={autoFocus}
                    aria-label="Add tags"
                />
                {/* Animated typing placeholder */}
                {value.length === 0 && !inputValue && displayedPlaceholder && (
                    <div className="absolute top-0 left-0 pointer-events-none flex items-center h-full text-stone-400 whitespace-pre">
                        {displayedPlaceholder}
                    </div>
                )}
                {/* Ghost suggestion */}
                {inputValue && suggestion && (
                    <div className="absolute top-0 left-0 pointer-events-none flex items-center h-full whitespace-pre font-inherit">
                        <span className="text-stone-800 opacity-0">{inputValue}</span>
                        <span className="text-stone-400/60">{suggestion}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
