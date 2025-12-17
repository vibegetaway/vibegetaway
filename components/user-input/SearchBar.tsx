"use client"

import { useState } from 'react'
import { SmartTagInput } from './SmartTagInput'
import { Search } from 'lucide-react'

interface SearchBarProps {
    vibe: string
    setVibe: (value: string) => void
    onSearch: () => void
}

export function SearchBar({ vibe, setVibe, onSearch }: SearchBarProps) {
    const [currentInput, setCurrentInput] = useState("")

    return (
        <div className="relative z-50 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2.5 px-3">
            {/* Single row: Vibe input, date selector, and search button */}
            <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold leading-tight flex items-center gap-2 whitespace-nowrap">
                    <span className="text-foreground">I want to</span>
                    {/* Fixed-width container with horizontal scroll for tags */}
                    <span className="inline-block align-middle w-[280px] max-w-[280px]">
                        <SmartTagInput
                            value={vibe ? vibe.split(',').map(v => v.trim()).filter(Boolean) : []}
                            onChange={(tags) => setVibe(tags.join(', '))}
                            suggestionType="vibe"
                            className="border-none bg-transparent p-0 focus-within:ring-0 focus-within:border-none max-h-[36px] rounded-none"
                            onEnter={onSearch}
                            onInputChange={setCurrentInput}
                        />
                    </span>
                </h1>
                <button
                    type="button"
                    onClick={onSearch}
                    disabled={!vibe.trim() && !currentInput.trim()}
                    className="relative flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-pink-400 disabled:hover:to-rose-500 shadow-sm hover:shadow-md shrink-0 group text-xs"
                    title="Search (Enter)"
                >
                    <Search className="w-3.5 h-3.5" />
                    <span>Find destinations</span>
                    {/* Keyboard shortcut hint */}
                    <span className="ml-0.5 text-[10px] opacity-70 border border-white/30 px-1 py-0.5 rounded">
                        ↵
                    </span>
                </button>
            </div>
        </div>
    )
}
