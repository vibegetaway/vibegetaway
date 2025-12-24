"use client"

import { useState } from 'react'
import Image from 'next/image'
import { SmartTagInput } from './SmartTagInput'
import { Search, SlidersHorizontal, User } from 'lucide-react'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { History } from 'lucide-react'

interface SearchBarProps {
    vibe: string
    setVibe: (value: string) => void
    onSearch: () => void
    onSettingsClick?: () => void
}

export function SearchBar({ vibe, setVibe, onSearch, onSettingsClick }: SearchBarProps) {
    const { isSignedIn } = useUser()
    const [currentInput, setCurrentInput] = useState("")
    const [isFocused, setIsFocused] = useState(false)
    const tags = vibe ? vibe.split(',').map(v => v.trim()).filter(Boolean) : []

    const handleEnter = () => {
        setIsFocused(false)
        onSearch()
    }

    return (
        <div className="relative z-50 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg py-2 px-4 w-full md:w-auto overflow-visible">
            {/* Single row: Logo (mobile), Vibe input, date selector, and search button */}
            <div className="flex items-center gap-2 min-w-0">
                {/* Mobile Logo - inside search bar */}
                <div className="md:hidden flex-shrink-0">
                    <Image
                        src="/assets/icon.png"
                        width={40}
                        height={40}
                        alt="VibeGetaway"
                        className="rounded-lg"
                    />
                </div>
                <h1 className="text-base font-bold leading-tight flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                    <span className="text-foreground whitespace-nowrap flex-shrink-0">I want to</span>
                    {/* Expandable container for tags */}
                    <span className="inline-block align-middle relative min-w-0 flex-1 sm:flex-initial sm:w-[140px] md:w-[320px] sm:max-w-[180px] md:max-w-[320px]" style={{ maxWidth: onSettingsClick && isSignedIn ? 'calc(100% - 240px)' : onSettingsClick ? 'calc(100% - 200px)' : 'calc(100% - 160px)' }}>
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
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onSearch}
                        disabled={!vibe.trim() && !currentInput.trim()}
                        className="hidden md:flex relative items-center justify-center w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-pink-400 disabled:hover:to-rose-500 shadow-sm hover:shadow-md shrink-0"
                        title="Search (Enter)"
                    >
                        <Search className="w-3.5 h-3.5" />
                    </button>
                    {onSettingsClick && (
                        <button
                            type="button"
                            onClick={onSettingsClick}
                            className="md:hidden relative flex items-center justify-center w-8 h-8 bg-white/90 backdrop-blur-md border border-violet-200 hover:bg-pink-50 hover:border-pink-300 text-violet-600 hover:text-pink-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md shrink-0"
                            title="Filter Settings"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                        </button>
                    )}
                    {/* Mobile Login/User button */}
                    <div className="md:hidden flex items-center">
                        {isSignedIn ? (
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "w-8 h-8 rounded-full ring-2 ring-violet-300",
                                        userButtonTrigger: "w-8 h-8",
                                        userButtonPopoverCard: "shadow-xl border border-violet-200 bottom-16",
                                    }
                                }}
                            >
                                <UserButton.MenuItems>
                                    <UserButton.Action
                                        label="Recent"
                                        labelIcon={<History className="w-4 h-4" />}
                                        onClick={() => {
                                            window.dispatchEvent(new CustomEvent('openRecentPanel'))
                                        }}
                                    />
                                </UserButton.MenuItems>
                            </UserButton>
                        ) : (
                            <SignInButton mode="modal">
                                <button
                                    type="button"
                                    className="relative flex items-center justify-center w-8 h-8 bg-white/90 backdrop-blur-md border border-violet-200 hover:bg-pink-50 hover:border-pink-300 text-violet-600 hover:text-pink-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md shrink-0"
                                    aria-label="Sign In"
                                    title="Sign In"
                                >
                                    <User className="w-4 h-4" />
                                </button>
                            </SignInButton>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
