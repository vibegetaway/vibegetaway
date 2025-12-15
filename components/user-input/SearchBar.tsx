"use client"

import { SmartTagInput } from './SmartTagInput'
import { FlexibleDateSelect } from './FlexibleDateSelect'
import { Search } from 'lucide-react'

interface SearchBarProps {
    vibe: string
    setVibe: (value: string) => void
    month: string
    setMonth: (value: string) => void
    onSearch: () => void
}

export function SearchBar({ vibe, setVibe, month, setMonth, onSearch }: SearchBarProps) {

    return (
        <div className="relative z-50 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2.5 px-3">
            {/* Single row: Vibe input, date selector, and search button */}
            <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold leading-tight flex items-center gap-2">
                    <span className="text-foreground whitespace-nowrap">I want to</span>
                    {/* Fixed-width container with horizontal scroll for tags */}
                    <span className="inline-block align-middle w-[280px] max-w-[280px]">
                        <SmartTagInput
                            value={vibe ? vibe.split(',').map(v => v.trim()).filter(Boolean) : []}
                            onChange={(tags) => setVibe(tags.join(', '))}
                            suggestionType="vibe"
                            className="border-none bg-transparent p-0 focus-within:ring-0 focus-within:border-none max-h-[36px] rounded-none"
                        />
                    </span>
                    <span className="text-sm text-stone-500 whitespace-nowrap">in</span>
                    <FlexibleDateSelect value={month} onChange={setMonth} />
                </h1>
                <button
                    type="button"
                    onClick={onSearch}
                    disabled={!vibe.trim()}
                    className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-pink-400 disabled:hover:to-rose-500 shadow-sm hover:shadow-md shrink-0 group"
                    title="Search (Enter)"
                >
                    <Search className="w-4 h-4" />
                    <span className="text-sm">Find destinations</span>
                    {/* Keyboard shortcut hint */}
                    <span className="ml-1 text-xs opacity-70 border border-white/30 px-1.5 py-0.5 rounded">
                        ↵
                    </span>
                </button>
            </div>
        </div>
    )
}
