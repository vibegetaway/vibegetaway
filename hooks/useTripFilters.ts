import { useState } from 'react'
import { usePostHog } from 'posthog-js/react'

export interface TripFilters {
    origin: string
    locations: string[]
    duration: [number, number]
    budget: number
    exclusions: string[]
    styles: string[]
}

export interface UseTripFiltersReturn {
    // State
    filters: TripFilters
    isFilterPanelOpen: boolean
    activeFilterType: string | undefined

    // Actions
    setOrigin: (origin: string) => void
    setLocations: (locations: string[]) => void
    setDuration: (duration: [number, number]) => void
    setBudget: (budget: number) => void
    setExclusions: (exclusions: string[]) => void
    setStyles: (styles: string[]) => void

    openFilterPanel: (type?: string) => void
    closeFilterPanel: () => void
    resetFilters: () => void

    // Helpers
    filterCounts: {
        origin: number
        destination: number
        exclusions: number
        budget: number
        all: number
    }
}

export const initialFilters: TripFilters = {
    origin: "",
    locations: [],
    duration: [3, 14],
    budget: 2000,
    exclusions: [],
    styles: []
}

export function useTripFilters(initialState: Partial<TripFilters> = {}): UseTripFiltersReturn {
    const posthog = usePostHog()

    const [filters, setFilters] = useState<TripFilters>({
        ...initialFilters,
        ...initialState
    })

    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
    const [activeFilterType, setActiveFilterType] = useState<string | undefined>(undefined)

    const setOrigin = (origin: string) => setFilters(prev => ({ ...prev, origin }))
    const setLocations = (locations: string[]) => setFilters(prev => ({ ...prev, locations }))
    const setDuration = (duration: [number, number]) => setFilters(prev => ({ ...prev, duration }))
    const setBudget = (budget: number) => setFilters(prev => ({ ...prev, budget }))
    const setExclusions = (exclusions: string[]) => setFilters(prev => ({ ...prev, exclusions }))
    const setStyles = (styles: string[]) => setFilters(prev => ({ ...prev, styles }))

    const openFilterPanel = (type?: string) => {
        if (type) {
            posthog?.capture('filter_panel_opened', { filter_type: type })
            setActiveFilterType(type)
        }
        setIsFilterPanelOpen(true)
    }

    const closeFilterPanel = () => {
        setIsFilterPanelOpen(false)
        setActiveFilterType(undefined)
    }

    const resetFilters = () => {
        setFilters(initialFilters)
    }

    const filterCounts = {
        origin: filters.origin ? 1 : 0,
        destination: filters.locations.length,
        exclusions: filters.exclusions.length,
        budget: filters.budget !== 2000 ? 1 : 0,
        all: (filters.origin ? 1 : 0) +
            filters.locations.length +
            filters.exclusions.length +
            (filters.budget !== 2000 ? 1 : 0)
    }

    return {
        filters,
        isFilterPanelOpen,
        activeFilterType,
        setOrigin,
        setLocations,
        setDuration,
        setBudget,
        setExclusions,
        setStyles,
        openFilterPanel,
        closeFilterPanel,
        resetFilters,
        filterCounts
    }
}
