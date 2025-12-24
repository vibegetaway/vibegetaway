'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Search, Clock, Calendar, History } from 'lucide-react'
import { getSavedLocationsCount } from '@/lib/itinerary'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'

interface LeftSidebarProps {
  onSearchClick?: () => void
  onItineraryClick?: () => void
}

export function LeftSidebar({ onSearchClick, onItineraryClick }: LeftSidebarProps) {
  const { isSignedIn } = useUser()
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    setSavedCount(getSavedLocationsCount())

    const handleLocationsUpdate = () => {
      setSavedCount(getSavedLocationsCount())
    }

    window.addEventListener('locationsUpdated', handleLocationsUpdate)

    return () => {
      window.removeEventListener('locationsUpdated', handleLocationsUpdate)
    }
  }, [])

  return (
    <div className="hidden md:flex fixed left-0 top-0 w-16 h-screen bg-violet-50 border-r border-violet-200/50 flex-col items-center py-4 gap-6 z-[60]">
      <div className="mb-2">
        <Image
          src="/assets/icon.png"
          alt="VibeGetaway"
          width={40}
          height={40}
          className="rounded-lg"
        />
      </div>

      {/* Search icon */}
      <button
        type="button"
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-pink-100/60 transition-colors cursor-pointer"
        onClick={onSearchClick}
        aria-label="Search Results"
      >
        <Search className="w-5 h-5 text-pink-500" strokeWidth={2} />
      </button>

      {/* Itinerary icon with counter badge */}
      <button
        type="button"
        className="relative w-12 h-12 flex items-center justify-center rounded-lg hover:bg-pink-100/60 transition-colors cursor-pointer"
        onClick={onItineraryClick}
        aria-label="Trip Plan"
      >
        <Calendar className="w-5 h-5 text-pink-500" strokeWidth={2} />
        {savedCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {savedCount > 9 ? '9+' : savedCount}
          </span>
        )}
      </button>

      <div className="flex-grow" />

      {/* User authentication at bottom */}
      <div className="mt-auto">
        {isSignedIn ? (
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 rounded-full ring-2 ring-violet-300 hover:ring-pink-400 transition-all",
                userButtonPopoverCard: "shadow-xl border border-violet-200",
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
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-violet-500 hover:from-pink-500 hover:to-violet-600 transition-all shadow-md hover:shadow-lg active:scale-95"
              aria-label="Sign In"
              title="Sign in with Google"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </button>
          </SignInButton>
        )}
      </div>
    </div>
  )
}

