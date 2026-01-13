'use client'

import { MapPin, DollarSign, Navigation } from 'lucide-react'

export type FilterType = 'origin' | 'destination' | 'budget'

interface ExploreFilterChipsProps {
    origin: string
    destinations: string[]
    budget: number
    onFilterClick: (filterType: FilterType) => void
}

export function ExploreFilterChips({
    origin,
    destinations,
    budget,
    onFilterClick
}: ExploreFilterChipsProps) {
    const formatBudget = (value: number): string => {
        if (value >= 5000) return '$5000+'
        return `$${value}`
    }

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 px-4 md:px-0 scrollbar-hide">
            <button
                onClick={() => onFilterClick('origin')}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all min-w-[140px] active:scale-95"
                style={{
                    borderColor: origin ? '#8b5cf6' : '#e5e7eb',
                    backgroundColor: origin ? '#f5f3ff' : '#ffffff',
                }}
            >
                <Navigation className="w-5 h-5" style={{ color: origin ? '#8b5cf6' : '#9ca3af' }} />
                <div className="flex flex-col items-start min-w-0">
                    <span className="text-xs font-medium text-gray-500">From</span>
                    <span className="text-sm font-semibold truncate max-w-[100px]" style={{ color: origin ? '#8b5cf6' : '#6b7280' }}>
                        {origin || 'Origin'}
                    </span>
                </div>
            </button>

            <button
                onClick={() => onFilterClick('destination')}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all min-w-[140px] active:scale-95"
                style={{
                    borderColor: destinations.length > 0 ? '#ec4899' : '#e5e7eb',
                    backgroundColor: destinations.length > 0 ? '#fdf2f8' : '#ffffff',
                }}
            >
                <MapPin className="w-5 h-5" style={{ color: destinations.length > 0 ? '#ec4899' : '#9ca3af' }} />
                <div className="flex flex-col items-start min-w-0">
                    <span className="text-xs font-medium text-gray-500">To</span>
                    <span className="text-sm font-semibold truncate max-w-[100px]" style={{ color: destinations.length > 0 ? '#ec4899' : '#6b7280' }}>
                        {destinations.length > 0 ? `${destinations.length} place${destinations.length > 1 ? 's' : ''}` : 'Destination'}
                    </span>
                </div>
            </button>

            <button
                onClick={() => onFilterClick('budget')}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all min-w-[140px] active:scale-95"
                style={{
                    borderColor: budget !== 2000 ? '#f59e0b' : '#e5e7eb',
                    backgroundColor: budget !== 2000 ? '#fffbeb' : '#ffffff',
                }}
            >
                <DollarSign className="w-5 h-5" style={{ color: budget !== 2000 ? '#f59e0b' : '#9ca3af' }} />
                <div className="flex flex-col items-start min-w-0">
                    <span className="text-xs font-medium text-gray-500">Budget</span>
                    <span className="text-sm font-semibold" style={{ color: budget !== 2000 ? '#f59e0b' : '#6b7280' }}>
                        {formatBudget(budget)}
                    </span>
                </div>
            </button>

            <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </div>
    )
}
