"use client"

import { useState, useEffect, useRef, KeyboardEvent } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnimatedVibeInputProps {
  value: string
  onChange: (value: string) => void
}

export function AnimatedVibeInput({ value, onChange }: AnimatedVibeInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [suggestion, setSuggestion] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [lastFullSuggestion, setLastFullSuggestion] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Parse current vibes from comma-separated string
  const vibes = value.split(",").map((v) => v.trim()).filter(Boolean)

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
            context: vibes.join(", ")
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
  }, [inputValue, vibes, lastFullSuggestion])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" && suggestion) {
      e.preventDefault()
      setInputValue(inputValue + suggestion)
      setSuggestion("")
    } else if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      if (inputValue.trim()) {
        const newValue = [...vibes, inputValue.trim()].join(", ")
        onChange(newValue)
        setInputValue("")
        setSuggestion("")
        setLastFullSuggestion("")
      }
    } else if (e.key === "Backspace" && !inputValue && vibes.length > 0) {
      const newValue = vibes.slice(0, -1).join(", ")
      onChange(newValue)
    }
  }

  const removeVibe = (indexToRemove: number) => {
    const newValue = vibes.filter((_, index) => index !== indexToRemove).join(", ")
    onChange(newValue)
    inputRef.current?.focus()
  }

  return (
    <div
      className="relative inline-flex flex-wrap items-center gap-2 p-1 bg-transparent border-b-2 border-border focus-within:border-accent transition-all duration-200 min-w-[200px]"
      onClick={() => inputRef.current?.focus()}
    >
      {vibes.map((vibe, index) => (
        <span
          key={index}
          className="flex items-center gap-1 px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-sm animate-in fade-in zoom-in duration-200"
        >
          {vibe}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              removeVibe(index)
            }}
            className="hover:text-destructive focus:outline-none"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      <div className="relative flex-1 min-w-[60px]">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setSuggestion("")
          }}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          placeholder={vibes.length === 0 ? "explore hidden beaches..." : ""}
        />
        {inputValue && suggestion && (
          <div className="absolute top-0 left-0 pointer-events-none whitespace-pre">
            <span className="invisible">{inputValue}</span>
            <span className="text-muted-foreground/60">{suggestion}</span>
          </div>
        )}
      </div>
    </div>
  )
}
