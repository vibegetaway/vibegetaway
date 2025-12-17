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
        "absolute top-1/2 -translate-y-1/2 left-[calc(100%+16px)] flex gap-2",
        "transition-all duration-300",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
      )}
    >
      {inspirationChips.map((chip) => {
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
              "whitespace-nowrap",
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

