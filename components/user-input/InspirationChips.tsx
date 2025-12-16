"use client"

import { inspirationChips, type InspirationChip } from '@/data/inspirationChips'
import { cn } from '@/lib/utils'

interface InspirationChipsProps {
  onChipClick: (chip: InspirationChip) => void
  isVisible: boolean
}

export function InspirationChips({ onChipClick, isVisible }: InspirationChipsProps) {
  if (!isVisible) return null

  return (
    <div className="absolute top-4 left-[calc(100%+16px)] flex gap-2 animate-in fade-in duration-300">
      {inspirationChips.map((chip) => (
        <button
          key={chip.id}
          onClick={() => onChipClick(chip)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-sm",
            "rounded-full shadow-md hover:shadow-lg",
            "transition-all duration-200 hover:scale-105",
            "text-sm font-medium text-gray-700 hover:text-gray-900",
            "border border-gray-200 hover:border-gray-300",
            "whitespace-nowrap"
          )}
        >
          <span className="text-base">{chip.icon}</span>
          <span>{chip.label}</span>
        </button>
      ))}
    </div>
  )
}
