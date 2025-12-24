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
    const [isFocused, setIsFocused] = useState(false)
    const tags = vibe ? vibe.split(',').map(v => v.trim()).filter(Boolean) : []

    const handleEnter = () => {
        setIsFocused(false)
        onSearch()
    }

    return (
        <div className="relative z-50 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg py-2 px-3">
            {/* Single row: Vibe input, date selector, and search button */}
            <div className="flex items-center gap-2.5">
                <h1 className="text-base font-bold leading-tight flex items-center gap-2 whitespace-nowrap">
                    <span className="text-foreground">I want to</span>
                    {/* Expandable container for tags */}
                    <span className="inline-block align-middle relative w-[180px] md:w-[320px] max-w-[320px]">
                        <SmartTagInput
                            value={tags}
                            onChange={(tags) => setVibe(tags.join(', '))}
                            suggestionType="vibe"
                            className="border-none bg-transparent p-0 focus-within:ring-0 focus-within:border-none rounded-none"
                            isFocused={isFocused}
                            onEnter={handleEnter}
                            onInputChange={setCurrentInput}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        />
                    </span>
                </h1>
                <button
                    type="button"
                    onClick={onSearch}
                    disabled={!vibe.trim() && !currentInput.trim()}
                    className="relative flex items-center justify-center w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-pink-400 disabled:hover:to-rose-500 shadow-sm hover:shadow-md shrink-0"
                    title="Search (Enter)"
                >
                    <Search className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}
