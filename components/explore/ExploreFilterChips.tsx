'use client'

import { MapPin, DollarSign, Navigation } from 'lucide-react'

export type FilterType = 'origin' | 'destination' | 'budget'

interface ExploreFilterChipsProps {
    origin: string
    destinations: string[]
    budget: number | null
    onFilterClick: (filterType: FilterType) => void
}

export function ExploreFilterChips({
    origin,
    destinations,
    budget,
    onFilterClick
}: ExploreFilterChipsProps) {
    const formatBudget = (value: number | null): string => {
        if (value === null) return 'Budget'
        if (value >= 5000) return '$5000+'
        return `$${value}`
    }

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 px-4 md:px-0 scrollbar-hide">
            <button
                onClick={() => onFilterClick('origin')}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all active:scale-95 whitespace-nowrap"
                style={{
                    borderColor: origin ? '#8b5cf6' : '#e5e7eb',
                    backgroundColor: origin ? '#f5f3ff' : '#ffffff',
                }}
            >
                <Navigation className="w-3.5 h-3.5" style={{ color: origin ? '#8b5cf6' : '#6b7280' }} />
                <span className="text-xs font-medium" style={{ color: origin ? '#8b5cf6' : '#374151' }}>
                    {origin || 'Origin'}
                </span>
            </button>

            <button
                onClick={() => onFilterClick('destination')}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all active:scale-95 whitespace-nowrap"
                style={{
                    borderColor: destinations.length > 0 ? '#ec4899' : '#e5e7eb',
                    backgroundColor: destinations.length > 0 ? '#fdf2f8' : '#ffffff',
                }}
            >
                <MapPin className="w-3.5 h-3.5" style={{ color: destinations.length > 0 ? '#ec4899' : '#6b7280' }} />
                <span className="text-xs font-medium" style={{ color: destinations.length > 0 ? '#ec4899' : '#374151' }}>
                    {destinations.length > 0 ? `${destinations.length} place${destinations.length > 1 ? 's' : ''}` : 'Destination'}
                </span>
            </button>

            <button
                onClick={() => onFilterClick('budget')}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all active:scale-95 whitespace-nowrap"
                style={{
                    borderColor: budget !== null ? '#f59e0b' : '#e5e7eb',
                    backgroundColor: budget !== null ? '#fffbeb' : '#ffffff',
                }}
            >
                <DollarSign className="w-3.5 h-3.5" style={{ color: budget !== null ? '#f59e0b' : '#6b7280' }} />
                <span className="text-xs font-medium" style={{ color: budget !== null ? '#f59e0b' : '#374151' }}>
                    {formatBudget(budget)}
                </span>
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
