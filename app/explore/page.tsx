'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { MobileNav } from '@/components/MobileNav'
import { ExploreFilterChips, type FilterType } from '@/components/explore/ExploreFilterChips'
import { ExploreFilterPanel, type OriginCoordinates } from '@/components/explore/ExploreFilterPanel'

const ExploreMap = dynamic(() => import('@/components/explore/ExploreMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
})

export default function ExplorePage() {
  const [origin, setOrigin] = useState('')
  const [originCoords, setOriginCoords] = useState<OriginCoordinates | null>(null)
  const [destinations, setDestinations] = useState<string[]>([])
  const [budget, setBudget] = useState<number | null>(null)
  const [activeFilterType, setActiveFilterType] = useState<FilterType | null>(null)

  const handleFilterClick = (filterType: FilterType) => {
    setActiveFilterType(filterType)
  }

  const handleFilterClose = () => {
    setActiveFilterType(null)
  }

  const handleFilterApply = () => {
    setActiveFilterType(null)
  }

  const handleOriginChange = (value: string, coords: OriginCoordinates | null) => {
    setOrigin(value)
    setOriginCoords(coords)
  }

  return (
    <main className="fixed inset-0">
      <ExploreMap
        className="w-full h-full"
        origin={origin}
        originCoords={originCoords}
        destinations={destinations}
        budget={budget}
      />

      <div className="absolute top-20 left-0 right-0 z-[1001] px-4 md:px-8">
        <ExploreFilterChips
          origin={origin}
          destinations={destinations}
          budget={budget}
          onFilterClick={handleFilterClick}
        />
      </div>

      <ExploreFilterPanel
        isOpen={activeFilterType !== null}
        filterType={activeFilterType}
        origin={origin}
        originCoords={originCoords}
        destinations={destinations}
        budget={budget}
        onOriginChange={handleOriginChange}
        onDestinationsChange={setDestinations}
        onBudgetChange={setBudget}
        onClose={handleFilterClose}
        onApply={handleFilterApply}
      />

      <div className="relative z-[10000]">
        <MobileNav activePage="explore" />
      </div>
    </main>
  )
}
