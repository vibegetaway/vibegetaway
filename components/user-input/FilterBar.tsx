"use client"

import { useState, useEffect } from "react"
import { MapPin, Ban, Globe, Calendar, ChevronDown, Check, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { SmartTagInput } from "./SmartTagInput"

const quickOptions = [
    "Anytime",
    "This Month",
    "Next Month",
    "Next 3 Months",
    "This Weekend",
]

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

interface FilterBarProps {
    onFilterClick: (filterType: string) => void
    filterCounts?: Record<string, number>
    month?: string
    setMonth?: (value: string) => void
    origin?: string
    setOrigin?: (value: string) => void
    locations?: string[]
    setLocations?: (value: string[]) => void
    exclusions?: string[]
    setExclusions?: (value: string[]) => void
    className?: string
}

export function FilterBar({ 
    onFilterClick, 
    filterCounts = {}, 
    month, 
    setMonth,
    origin = "",
    setOrigin,
    locations = [],
    setLocations,
    exclusions = [],
    setExclusions,
    className 
}: FilterBarProps) {
    const [isDateOpen, setIsDateOpen] = useState(false)
    const [editingFilter, setEditingFilter] = useState<string | null>(null)
    
    const filters = [
        { id: "date", label: month && month !== "Anytime" ? month : "Date", icon: Calendar },
        { id: "destination", label: "Destination", icon: Globe },
        { id: "all-filters", label: "All Filters", icon: Filter },
    ]

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            
            if (isDateOpen) {
                const dateDropdown = target.closest('[data-date-dropdown]')
                const dateButton = target.closest('[data-date-button]')
                
                if (!dateDropdown && !dateButton) {
                    setIsDateOpen(false)
                }
            }

            if (editingFilter) {
                const filterEditor = target.closest('[data-filter-editor]')
                const filterButton = target.closest('[data-filter-button]')
                
                if (!filterEditor && !filterButton) {
                    setEditingFilter(null)
                }
            }
        }

        if (isDateOpen || editingFilter) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
            }
        }
    }, [isDateOpen, editingFilter])

    return (
        <div className={cn("flex items-center gap-2 flex-wrap", className)}>
            {filters.map((filter) => {
                const count = filterCounts[filter.id] || 0
                const hasFilter = filter.id === 'date' 
                    ? (month && month !== "Anytime")
                    : count > 0

                if (filter.id === 'date' && setMonth) {
                    return (
                        <div key={filter.id} className="relative" data-date-dropdown>
                            <button
                                type="button"
                                data-date-button
                                onClick={() => {
                                    setEditingFilter(null)
                                    setIsDateOpen(!isDateOpen)
                                }}
                                className={cn(
                                    "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm",
                                    "bg-white/90 backdrop-blur-md border",
                                    hasFilter ? "bg-sky-50 border-sky-300 text-sky-700" : "border-violet-200 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-700",
                                    "active:scale-95"
                                )}
                            >
                                <Calendar className={cn("w-3.5 h-3.5", hasFilter ? "text-sky-600" : "text-violet-500")} />
                                <span>{month && month !== "Anytime" ? month : "Date"}</span>
                            </button>

                            {isDateOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsDateOpen(false)}
                                    />
                                    <div className="absolute top-full mt-2 left-0 w-[280px] bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200" data-date-dropdown>
                                        {/* Quick Options */}
                                        <div className="p-2 border-b border-stone-100">
                                            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-2 py-1 mb-1">
                                                Quick Select
                                            </div>
                                            {quickOptions.map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => {
                                                        setMonth(option)
                                                        setIsDateOpen(false)
                                                    }}
                                                    className={cn(
                                                        "w-full px-3 py-2 text-left text-sm rounded-lg transition-colors flex items-center justify-between group",
                                                        month === option ? "bg-pink-50 text-pink-700" : "hover:bg-violet-50 text-violet-600"
                                                    )}
                                                >
                                                    {option}
                                                    {month === option && <Check className="w-3 h-3 text-pink-500" />}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Specific Months */}
                                        <div className="p-2 max-h-[200px] overflow-y-auto">
                                            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-2 py-1 mb-1">
                                                Specific Month
                                            </div>
                                            <div className="grid grid-cols-2 gap-1">
                                                {months.map((monthOption) => (
                                                    <button
                                                        key={monthOption}
                                                        onClick={() => {
                                                            setMonth(monthOption)
                                                            setIsDateOpen(false)
                                                        }}
                                                        className={cn(
                                                            "px-3 py-2 text-left text-sm rounded-lg transition-colors",
                                                            month === monthOption ? "bg-pink-50 text-pink-700 font-medium" : "hover:bg-violet-50 text-violet-600"
                                                        )}
                                                    >
                                                        {monthOption}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )
                }

                // Destination - inline SmartTagInput
                if (filter.id === 'destination' && setLocations) {
                    const isEditing = editingFilter === 'destination'
                    return (
                        <div key={filter.id} className="relative" data-filter-editor>
                            {!isEditing ? (
                                <button
                                    data-filter-button
                                    onClick={() => {
                                        setIsDateOpen(false)
                                        setEditingFilter(editingFilter === 'destination' ? null : 'destination')
                                    }}
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
                                    {hasFilter && (
                                        <span className="flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-sky-400 text-white text-xs font-bold rounded-full">
                                            {count}
                                        </span>
                                    )}
                                </button>
                            ) : (
                                <div className="relative bg-white rounded-full shadow-sm border border-violet-200 px-2 py-1 min-w-[200px]" data-filter-editor>
                                    <SmartTagInput
                                        value={locations}
                                        onChange={setLocations}
                                        placeholder="e.g. Bali, Asia, JFK"
                                        suggestionType="location"
                                        className="border-none bg-transparent p-0 focus-within:ring-0 focus-within:border-none max-h-[28px] rounded-none text-sm"
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>
                    )
                }

                // All Filters - opens filter panel
                if (filter.id === 'all-filters') {
                    const allFiltersCount = filterCounts.all || 0
                    const hasAnyFilters = allFiltersCount > 0
                    return (
                        <button
                            key={filter.id}
                            onClick={() => {
                                setIsDateOpen(false)
                                setEditingFilter(null)
                                onFilterClick('all-filters')
                            }}
                            className={cn(
                                "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm",
                                "bg-white/90 backdrop-blur-md border border-violet-200",
                                "hover:bg-pink-50 hover:border-pink-300 hover:text-pink-700",
                                "active:scale-95",
                                hasAnyFilters && "bg-sky-50 border-sky-300 text-sky-700"
                            )}
                        >
                            <filter.icon className="w-3.5 h-3.5" />
                            <span>{filter.label}</span>
                            {hasAnyFilters && (
                                <span className="flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-sky-400 text-white text-xs font-bold rounded-full">
                                    {allFiltersCount}
                                </span>
                            )}
                        </button>
                    )
                }

                // Fallback for other filters (shouldn't happen, but just in case)
                return (
                    <button
                        key={filter.id}
                        onClick={() => {
                            setIsDateOpen(false)
                            setEditingFilter(null)
                        }}
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
