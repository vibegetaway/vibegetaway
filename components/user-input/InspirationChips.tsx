"use client"

import { Heart, Mountain, Coffee, Landmark, Utensils } from "lucide-react"
import { cn } from "@/lib/utils"

interface InspirationChipsProps {
  onSelectVibe: (vibe: string) => void
  className?: string
}

export function InspirationChips({ onSelectVibe, className }: InspirationChipsProps) {
  const chips = [
    { label: "Honeymoon", icon: Heart, vibe: "Romantic, Honeymoon" },
    { label: "Adventure", icon: Mountain, vibe: "Adventure, Hiking, Nature" },
    { label: "Relaxation", icon: Coffee, vibe: "Relaxing, Chill, Spa" },
    { label: "Culture", icon: Landmark, vibe: "Culture, History, Museums" },
    { label: "Foodie", icon: Utensils, vibe: "Foodie, Restaurants, Culinary" },
  ]

  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto no-scrollbar py-1", className)}>
      {chips.map((chip) => (
        <button
          key={chip.label}
          onClick={() => onSelectVibe(chip.vibe)}
          className="flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md border border-stone-200 hover:border-amber-300 transition-all duration-200 group whitespace-nowrap"
        >
          <chip.icon className="w-4 h-4 text-stone-500 group-hover:text-amber-500 transition-colors" />
          <span className="text-sm font-medium text-stone-700 group-hover:text-amber-700 transition-colors">
            {chip.label}
          </span>
        </button>
      ))}
    </div>
  )
}
