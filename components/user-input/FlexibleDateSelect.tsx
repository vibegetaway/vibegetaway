"use client"

import { useState } from "react"
import { Calendar, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

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

interface FlexibleDateSelectProps {
    value: string
    onChange: (value: string) => void
}

export function FlexibleDateSelect({ value, onChange }: FlexibleDateSelectProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="relative inline-block">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "pl-2 pr-8 py-0.5 bg-transparent rounded-md",
                    "text-stone-800 font-medium flex items-center gap-1.5",
                    "focus:outline-none focus:bg-amber-50/50",
                    "transition-all duration-200",
                    "hover:bg-stone-50",
                    "min-w-[140px]"
                )}
            >
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-base">{value || "Anytime"}</span>
                <ChevronDown
                    className={cn("h-3.5 w-3.5 absolute right-1 text-stone-400 transition-transform", isOpen && "rotate-180")}
                />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full mt-2 left-0 w-[280px] bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">

                        {/* Quick Options */}
                        <div className="p-2 border-b border-stone-100">
                            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-2 py-1 mb-1">
                                Quick Select
                            </div>
                            {quickOptions.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        onChange(option)
                                        setIsOpen(false)
                                    }}
                                    className={cn(
                                        "w-full px-3 py-2 text-left text-sm rounded-lg transition-colors flex items-center justify-between group",
                                        value === option ? "bg-amber-50 text-amber-900" : "hover:bg-stone-50 text-stone-600"
                                    )}
                                >
                                    {option}
                                    {value === option && <Check className="w-3 h-3 text-amber-600" />}
                                </button>
                            ))}
                        </div>

                        {/* Specific Months */}
                        <div className="p-2 max-h-[200px] overflow-y-auto">
                            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-2 py-1 mb-1">
                                Specific Month
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                {months.map((month) => (
                                    <button
                                        key={month}
                                        onClick={() => {
                                            onChange(month)
                                            setIsOpen(false)
                                        }}
                                        className={cn(
                                            "px-3 py-2 text-left text-sm rounded-lg transition-colors",
                                            value === month ? "bg-amber-50 text-amber-900 font-medium" : "hover:bg-stone-50 text-stone-600"
                                        )}
                                    >
                                        {month}
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
