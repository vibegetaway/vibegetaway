"use client"

import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const animatedPlaceholders = [
  "explore hidden beaches",
  "climb mountain peaks",
  "discover ancient ruins",
  "taste local cuisine",
  "find inner peace",
]

export function AnimatedVibeInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    if (!value) {
      const currentPlaceholder = animatedPlaceholders[placeholderIndex]

      if (isTyping) {
        if (displayedText.length < currentPlaceholder.length) {
          const timeout = setTimeout(() => {
            setDisplayedText(currentPlaceholder.slice(0, displayedText.length + 1))
          }, 80)
          return () => clearTimeout(timeout)
        } else {
          const timeout = setTimeout(() => {
            setIsTyping(false)
          }, 2000)
          return () => clearTimeout(timeout)
        }
      } else {
        if (displayedText.length > 0) {
          const timeout = setTimeout(() => {
            setDisplayedText(displayedText.slice(0, -1))
          }, 50)
          return () => clearTimeout(timeout)
        } else {
          setPlaceholderIndex((prev) => (prev + 1) % animatedPlaceholders.length)
          setIsTyping(true)
        }
      }
    }
  }, [displayedText, isTyping, placeholderIndex, value])

  return (
    <div className="relative inline-flex items-center group">
      <div className="relative">
        {/* <Sparkles className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-accent pointer-events-none mr-2" /> */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={displayedText}
          className={cn(
            "h-12 pl-8 pr-10 bg-transparent border-b-2 border-border",
            "text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:border-accent",
            "transition-all duration-200",
            "min-w-[10px] md:min-w-[300px]",
          )}
        />
      </div>
    </div>
  )
}
