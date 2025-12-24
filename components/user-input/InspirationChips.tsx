"use client"

import { inspirationChips, type InspirationChip } from '@/data/inspirationChips'
import { cn } from '@/lib/utils'

interface InspirationChipsProps {
  onChipClick: (chip: InspirationChip) => void
  isVisible: boolean
}

export function InspirationChips({ onChipClick, isVisible }: InspirationChipsProps) {
  return (
    <div 
      className={cn(
        "flex gap-2 overflow-x-auto scroll-smooth",
        "md:absolute md:top-1/2 md:-translate-y-1/2 md:left-[calc(100%+16px)] md:overflow-visible",
        "transition-all duration-300",
        "scrollbar-hide",
        isVisible ? "opacity-100 translate-y-0 md:translate-x-0" : "opacity-0 -translate-y-2 md:translate-x-4 pointer-events-none"
      )}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {inspirationChips.slice(0, 3).map((chip) => {
        const Icon = chip.icon
        return (
          <button
            key={chip.id}
            onClick={() => onChipClick(chip)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-sm",
              "rounded-full shadow-md",
              "transition-all duration-300 hover:scale-105",
              "text-sm font-medium text-gray-700 hover:text-rose-600",
              "border border-gray-200 hover:border-rose-300",
              "whitespace-nowrap flex-shrink-0",
              "hover:shadow-[0_0_20px_rgba(251,113,133,0.4)]"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{chip.label}</span>
          </button>
        )
      })}
    </div>
  )
}

