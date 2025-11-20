import { X, MapPin, Globe, Plane, Clock, Wallet, Ban, PartyPopper, CloudSun, Check } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { SmartTagInput } from "../user-input/SmartTagInput"

interface FilterSidePanelProps {
    isOpen: boolean
    onClose: () => void
    activeFilter?: string
    origin: string
    setOrigin: (value: string) => void
    locations: string[]
    setLocations: (value: string[]) => void
    duration: [number, number]
    setDuration: (value: [number, number]) => void
    budget: number
    setBudget: (value: number) => void
    exclusions: string[]
    setExclusions: (value: string[]) => void
    styles: string[]
    setStyles: (value: string[]) => void
}

export function FilterSidePanel({
    isOpen,
    onClose,
    activeFilter,
    origin,
    setOrigin,
    locations,
    setLocations,
    duration,
    setDuration,
    budget,
    setBudget,
    exclusions,
    setExclusions,
    styles,
    setStyles
}: FilterSidePanelProps) {

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[80] transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={cn(
                    "fixed top-0 left-0 h-screen w-full max-w-md bg-stone-50 shadow-2xl z-[90] transition-transform duration-300 ease-in-out flex flex-col",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-white">
                    <h2 className="text-xl font-bold text-stone-800">Filters</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-stone-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Origin & Destination */}
                    <div className="space-y-6">
                        {/* Origin */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 uppercase tracking-wide">
                                <MapPin className="w-4 h-4" />
                                Origin
                            </label>
                            <input
                                type="text"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                placeholder="Where are you flying from?"
                                className="w-full px-4 py-3 rounded-lg bg-white border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                                autoFocus={activeFilter === 'origin'}
                            />
                        </div>

                        {/* Destination Area */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 uppercase tracking-wide">
                                <Globe className="w-4 h-4" />
                                Destination Area
                            </label>
                            <SmartTagInput
                                value={locations}
                                onChange={setLocations}
                                placeholder="e.g. Bali, Asia, JFK, Paris"
                                suggestionType="location"
                                autoFocus={activeFilter === 'destination'}
                            />
                            <p className="text-xs text-stone-500">
                                Specify countries, regions, cities, or even airports.
                            </p>
                        </div>
                    </div>

                    {/* Exclusions */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 uppercase tracking-wide">
                            <Ban className="w-4 h-4" />
                            Exclusions
                        </label>
                        <SmartTagInput
                            value={exclusions}
                            onChange={setExclusions}
                            placeholder="e.g. Crowds, Rainy Season"
                            suggestionType="exclusion"
                        />
                    </div>

                    {/* Trip Details */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-stone-800 border-b border-stone-200 pb-2">Trip Details</h3>

                        {/* Duration */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 uppercase tracking-wide">
                                <Clock className="w-4 h-4" />
                                Duration (Days)
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 space-y-1">
                                    <span className="text-xs text-stone-500">Min</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={duration[0]}
                                        onChange={(e) => setDuration([parseInt(e.target.value) || 1, duration[1]])}
                                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-100 outline-none"
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <span className="text-xs text-stone-500">Max</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={duration[1]}
                                        onChange={(e) => setDuration([duration[0], parseInt(e.target.value) || 1])}
                                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-100 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 uppercase tracking-wide">
                                    <Wallet className="w-4 h-4" />
                                    Max Budget
                                </label>
                                <span className="text-sm font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                                    ${budget}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="500"
                                max="10000"
                                step="100"
                                value={budget}
                                onChange={(e) => setBudget(parseInt(e.target.value))}
                                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-stone-200 bg-white">
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setOrigin("")
                                setLocations([])
                                setDuration([3, 14])
                                setBudget(2000)
                                setExclusions([])
                                setStyles([])
                            }}
                            className="px-6 py-3 rounded-lg border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition-colors"
                        >
                            Reset
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-amber-600 to-orange-500 text-white font-semibold hover:from-amber-700 hover:to-orange-600 shadow-md hover:shadow-lg transition-all"
                        >
                            Show results
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
