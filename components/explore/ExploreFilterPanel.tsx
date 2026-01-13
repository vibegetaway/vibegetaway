'use client'

import { X, Navigation, MapPin, DollarSign, Check } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import type { FilterType } from './ExploreFilterChips'

interface ExploreFilterPanelProps {
    isOpen: boolean
    filterType: FilterType | null
    origin: string
    destinations: string[]
    budget: number
    onOriginChange: (value: string) => void
    onDestinationsChange: (values: string[]) => void
    onBudgetChange: (value: number) => void
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
    const [citySuggestions, setCitySuggestions] = useState<Array<{ name: string; country: string }>>([])
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
        onOriginChange(localOrigin)
        onDestinationsChange(localDestinations)
        onBudgetChange(localBudget)
        onApply()
    }

    const handleClear = () => {
        setLocalOrigin('')
        setLocalDestinations([])
        setLocalBudget(2000)
    }

    const addDestination = (city: string) => {
        if (!localDestinations.includes(city)) {
            setLocalDestinations([...localDestinations, city])
        }
        setDestinationInput('')
        setCitySuggestions([])
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
                return 'What\'s your budget?'
        }
    }

    const getFilterIcon = () => {
        switch (filterType) {
            case 'origin':
                return <Navigation className="w-6 h-6 text-violet-600" />
            case 'destination':
                return <MapPin className="w-6 h-6 text-pink-600" />
            case 'budget':
                return <DollarSign className="w-6 h-6 text-amber-600" />
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
                className="fixed inset-x-0 bottom-0 z-[10000] bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out"
                style={{
                    transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
                    maxHeight: '85vh',
                }}
            >
                <div className="flex flex-col h-full max-h-[85vh]">
                    <div className="flex-shrink-0 p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {getFilterIcon()}
                                <h2 className="text-xl font-bold text-gray-900">{getFilterTitle()}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {filterType === 'origin' && (
                            <div className="space-y-4">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={localOrigin}
                                    onChange={(e) => setLocalOrigin(e.target.value)}
                                    placeholder="Enter city name..."
                                    className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-violet-500 transition-colors"
                                />

                                {citySuggestions.length > 0 && (
                                    <div className="space-y-2">
                                        {citySuggestions.map((city, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setLocalOrigin(city.name)
                                                    setCitySuggestions([])
                                                }}
                                                className="w-full p-4 text-left bg-gray-50 hover:bg-violet-50 rounded-xl transition-colors active:scale-98"
                                            >
                                                <div className="font-semibold text-gray-900">{city.name}</div>
                                                <div className="text-sm text-gray-500">{city.country}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {filterType === 'destination' && (
                            <div className="space-y-4">
                                {localDestinations.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {localDestinations.map((dest) => (
                                            <div
                                                key={dest}
                                                className="flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-full"
                                            >
                                                <span className="font-medium">{dest}</span>
                                                <button
                                                    onClick={() => removeDestination(dest)}
                                                    className="hover:bg-pink-200 rounded-full p-1 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
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
                                    className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
                                />

                                {citySuggestions.length > 0 && (
                                    <div className="space-y-2">
                                        {citySuggestions.map((city, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => addDestination(city.name)}
                                                className="w-full p-4 text-left bg-gray-50 hover:bg-pink-50 rounded-xl transition-colors active:scale-98"
                                            >
                                                <div className="font-semibold text-gray-900">{city.name}</div>
                                                <div className="text-sm text-gray-500">{city.country}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {filterType === 'budget' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-3">
                                    {BUDGET_PRESETS.map((preset) => (
                                        <button
                                            key={preset.value}
                                            onClick={() => setLocalBudget(preset.value)}
                                            className="relative p-6 rounded-xl border-2 transition-all active:scale-95"
                                            style={{
                                                borderColor: localBudget === preset.value ? '#f59e0b' : '#e5e7eb',
                                                backgroundColor: localBudget === preset.value ? '#fffbeb' : '#ffffff',
                                            }}
                                        >
                                            {localBudget === preset.value && (
                                                <div className="absolute top-2 right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                            <div className="text-2xl font-bold text-gray-900">{preset.label}</div>
                                            <div className="text-sm text-gray-500 mt-1">per person</div>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Custom amount: ${localBudget}
                                    </label>
                                    <input
                                        type="range"
                                        min="500"
                                        max="5000"
                                        step="100"
                                        value={localBudget}
                                        onChange={(e) => setLocalBudget(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>$500</span>
                                        <span>$5000+</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-shrink-0 p-6 border-t border-gray-200 space-y-3">
                        <button
                            onClick={handleApply}
                            className="w-full py-4 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-98"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={handleClear}
                            className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors active:scale-98"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
