"use client"

import { SlidersHorizontal, MapPin, Wallet, Ban, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterBarProps {
    onFilterClick: (filterType: string) => void
    filterCounts?: Record<string, number>
    className?: string
}

export function FilterBar({ onFilterClick, filterCounts = {}, className }: FilterBarProps) {
    const filters = [
        { id: "origin", label: "Origin", icon: MapPin },
        { id: "destination", label: "Destination", icon: Globe },
        { id: "exclusions", label: "Exclusions", icon: Ban },
        { id: "budget", label: "Budget", icon: Wallet },
        { id: "all", label: "All filters", icon: SlidersHorizontal },
    ]

    return (
        <div className={cn("flex items-center gap-2 flex-wrap", className)}>
            {filters.map((filter) => {
                const count = filterCounts[filter.id] || 0
                const hasFilter = count > 0

                return (
                    <button
                        key={filter.id}
                        onClick={() => onFilterClick(filter.id)}
                        className={cn(
                            "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm",
                            "bg-white/90 backdrop-blur-md border border-violet-200",
                            "hover:bg-pink-50 hover:border-pink-300 hover:text-pink-700",
                            "active:scale-95",
                            hasFilter && "bg-sky-50 border-sky-300 text-sky-700"
                        )}
                    >
                        <filter.icon className="w-3.5 h-3.5" />
                        <span>{filter.label}</span>

                        {/* Badge for counts > 0 */}
                        {hasFilter && (
                            <span className="flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-sky-400 text-white text-xs font-bold rounded-full">
                                {count}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}
