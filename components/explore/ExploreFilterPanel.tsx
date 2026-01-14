'use client'

import { X, Navigation, MapPin, DollarSign, Check } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import type { FilterType } from './ExploreFilterChips'

export interface OriginCoordinates {
    lat: number
    lng: number
}

interface ExploreFilterPanelProps {
    isOpen: boolean
    filterType: FilterType | null
    origin: string
    originCoords: OriginCoordinates | null
    destinations: string[]
    budget: number | null
    onOriginChange: (value: string, coords: OriginCoordinates | null) => void
    onDestinationsChange: (values: string[]) => void
    onBudgetChange: (value: number | null) => void
    onClose: () => void
    onApply: () => void
}

const BUDGET_PRESETS = [
    { value: 500, label: '$500' },
    { value: 1000, label: '$1000' },
    { value: 2000, label: '$2000' },
    { value: 3500, label: '$3500' },
    { value: 5000, label: '$5000+' },
]

export function ExploreFilterPanel({
    isOpen,
    filterType,
    origin,
    originCoords,
    destinations,
    budget,
    onOriginChange,
    onDestinationsChange,
    onBudgetChange,
    onClose,
    onApply
}: ExploreFilterPanelProps) {
    const [localOrigin, setLocalOrigin] = useState(origin)
    const [localDestinations, setLocalDestinations] = useState<string[]>(destinations)
    const [localBudget, setLocalBudget] = useState(budget)
    const [destinationInput, setDestinationInput] = useState('')
    const [citySuggestions, setCitySuggestions] = useState<Array<{ name: string; country: string; coordinates?: { lat: number; lng: number } }>>([])
    const [isSearching, setIsSearching] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setLocalOrigin(origin)
        setLocalDestinations(destinations)
        setLocalBudget(budget)
    }, [origin, destinations, budget, isOpen])

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300)
        }
    }, [isOpen, filterType])

    const searchCities = async (query: string) => {
        if (!query.trim() || query.length < 2) {
            setCitySuggestions([])
            return
        }

        setIsSearching(true)
        try {
            const response = await fetch(`/api/city-search?q=${encodeURIComponent(query)}`)
            if (response.ok) {
                const data = await response.json()
                setCitySuggestions(data.suggestions || [])
            }
        } catch (error) {
            console.error('Error searching cities:', error)
        } finally {
            setIsSearching(false)
        }
    }

    useEffect(() => {
        if (filterType === 'origin' || filterType === 'destination') {
            const query = filterType === 'origin' ? localOrigin : destinationInput
            const timeoutId = setTimeout(() => searchCities(query), 300)
            return () => clearTimeout(timeoutId)
        }
    }, [localOrigin, destinationInput, filterType])

    const handleApply = () => {
        onOriginChange(localOrigin, null)
        onDestinationsChange(localDestinations)
        onBudgetChange(localBudget)
        onApply()
    }

    const handleClear = () => {
        setLocalOrigin('')
        setLocalDestinations([])
        setLocalBudget(null)
    }

    const addDestination = (city: string) => {
        if (!localDestinations.includes(city)) {
            const updatedDestinations = [...localDestinations, city]
            setLocalDestinations(updatedDestinations)
            setDestinationInput('')
            setCitySuggestions([])
            setTimeout(() => {
                onDestinationsChange(updatedDestinations)
                onApply()
            }, 0)
        } else {
            setDestinationInput('')
            setCitySuggestions([])
        }
    }

    const removeDestination = (city: string) => {
        setLocalDestinations(localDestinations.filter(d => d !== city))
    }

    if (!isOpen || !filterType) return null

    const getFilterTitle = () => {
        switch (filterType) {
            case 'origin':
                return 'Where are you traveling from?'
            case 'destination':
                return 'Where do you want to go?'
            case 'budget':
                return 'What\'s your daily budget?'
        }
    }

    const getFilterIcon = () => {
        switch (filterType) {
            case 'origin':
                return <Navigation className="w-5 h-5 text-violet-600" />
            case 'destination':
                return <MapPin className="w-5 h-5 text-pink-600" />
            case 'budget':
                return <DollarSign className="w-5 h-5 text-amber-600" />
        }
    }

    return (
        <>
            <div
                className="fixed inset-0 bg-black/40 z-[9999] transition-opacity"
                onClick={onClose}
                style={{
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? 'auto' : 'none'
                }}
            />

            <div
                className="fixed inset-x-0 bottom-[84px] md:bottom-0 z-[10000] bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out"
                style={{
                    transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
                    maxHeight: 'calc(85vh - 84px)',
                }}
            >
                <div className="flex flex-col h-full max-h-[calc(85vh-84px)]">
                    <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {getFilterIcon()}
                                <h2 className="text-lg font-bold text-gray-900">{getFilterTitle()}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5">
                        {filterType === 'origin' && (
                            <div className="space-y-3">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={localOrigin}
                                    onChange={(e) => setLocalOrigin(e.target.value)}
                                    placeholder="Enter city name..."
                                    className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                                />

                                {citySuggestions.length > 0 && (
                                    <div className="space-y-1.5">
                                        {citySuggestions.map((city, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setLocalOrigin(city.name)
                                                    setCitySuggestions([])
                                                    const coords = city.coordinates ? { lat: city.coordinates.lat, lng: city.coordinates.lng } : null
                                                    setTimeout(() => {
                                                        onOriginChange(city.name, coords)
                                                        onApply()
                                                    }, 0)
                                                }}
                                                className="w-full p-3 text-left bg-gray-50 hover:bg-violet-50 rounded-lg transition-colors active:scale-98"
                                            >
                                                <div className="font-medium text-sm text-gray-900">{city.name}</div>
                                                <div className="text-xs text-gray-500">{city.country}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {filterType === 'destination' && (
                            <div className="space-y-3">
                                {localDestinations.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {localDestinations.map((dest) => (
                                            <div
                                                key={dest}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full"
                                            >
                                                <span className="text-xs font-medium">{dest}</span>
                                                <button
                                                    onClick={() => removeDestination(dest)}
                                                    className="hover:bg-pink-200 rounded-full p-0.5 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={destinationInput}
                                    onChange={(e) => setDestinationInput(e.target.value)}
                                    placeholder="Add destination..."
                                    className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                                />

                                {citySuggestions.length > 0 && (
                                    <div className="space-y-1.5">
                                        {citySuggestions.map((city, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => addDestination(city.name)}
                                                className="w-full p-3 text-left bg-gray-50 hover:bg-pink-50 rounded-lg transition-colors active:scale-98"
                                            >
                                                <div className="font-medium text-sm text-gray-900">{city.name}</div>
                                                <div className="text-xs text-gray-500">{city.country}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {filterType === 'budget' && (
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {BUDGET_PRESETS.map((preset) => (
                                        <button
                                            key={preset.value}
                                            onClick={() => setLocalBudget(preset.value)}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all active:scale-95"
                                            style={{
                                                borderColor: localBudget === preset.value ? '#f59e0b' : '#e5e7eb',
                                                backgroundColor: localBudget === preset.value ? '#fffbeb' : '#fffbf0',
                                            }}
                                        >
                                            {localBudget === preset.value && (
                                                <Check className="w-3.5 h-3.5 text-amber-600" />
                                            )}
                                            <span className="text-sm font-medium" style={{ color: localBudget === preset.value ? '#f59e0b' : '#6b7280' }}>
                                                {preset.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {localBudget !== null && (
                                    <div className="space-y-2 pt-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700">
                                                Custom: ${localBudget}/day
                                            </label>
                                        </div>
                                        <input
                                            type="range"
                                            min="500"
                                            max="5000"
                                            step="100"
                                            value={localBudget || 2000}
                                            onChange={(e) => setLocalBudget(Number(e.target.value))}
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>$500</span>
                                            <span>$5000+</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex-shrink-0 px-5 pt-4 pb-5 border-t border-gray-200 space-y-2">
                        <button
                            onClick={handleApply}
                            className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all active:scale-98 text-sm"
                        >
                            Apply
                        </button>
                        <button
                            onClick={handleClear}
                            className="w-full py-2 bg-gray-100 text-gray-700 font-medium rounded-full hover:bg-gray-200 transition-colors active:scale-98 text-sm"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
