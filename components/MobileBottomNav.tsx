'use client'

import { useState, useEffect } from 'react'
import { Search, Calendar } from 'lucide-react'
import { getSavedLocationsCount } from '@/lib/itinerary'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface MobileBottomNavProps {
    onSearchClick?: () => void
    onItineraryClick?: () => void
}

export function MobileBottomNav({ onSearchClick, onItineraryClick }: MobileBottomNavProps) {
    const router = useRouter()
    const [savedCount, setSavedCount] = useState(0)

    useEffect(() => {
        setSavedCount(getSavedLocationsCount())

        const handleLocationsUpdate = () => {
            setSavedCount(getSavedLocationsCount())
        }

        window.addEventListener('locationsUpdated', handleLocationsUpdate)

        return () => {
            window.removeEventListener('locationsUpdated', handleLocationsUpdate)
        }
    }, [])

    return (
        <div className="fixed bottom-0 left-0 w-full h-16 bg-white border-t border-violet-200/50 flex flex-row justify-around items-center z-[60] md:hidden px-2 pb-safe">
            {/* Search icon */}
            <button
                type="button"
                className="flex flex-col items-center justify-center p-2 text-gray-500 hover:text-pink-500"
                onClick={onSearchClick}
                aria-label="Search"
            >
                <Search className="w-6 h-6" strokeWidth={2} />
                <span className="text-[10px] mt-1">Search</span>
            </button>

            {/* Plan Trip button */}
            <button
                type="button"
                onClick={() => router.push('/plan')}
                className={cn(
                    "relative flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200",
                    savedCount > 0
                        ? "bg-violet-50 text-violet-600 border border-violet-200"
                        : "text-violet-600 hover:bg-violet-50/50 border border-transparent hover:border-violet-200"
                )}
                aria-label="Plan Trip"
            >
                <div className="relative">
                    <Calendar className="w-6 h-6" strokeWidth={2} />
                    {savedCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {savedCount > 9 ? '9+' : savedCount}
                        </span>
                    )}
                </div>
                <span className="text-[10px] mt-1 font-medium">Plan Trip</span>
            </button>
        </div>
    )
}
