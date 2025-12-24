'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Clock, User, LogOut } from 'lucide-react'
import { SignInButton, useUser, useClerk } from '@clerk/nextjs'
import { cn } from '@/lib/utils'

interface ProfileMenuProps {
  onSearchHistoryClick?: () => void
  variant?: 'mobile' | 'desktop'
}

export function ProfileMenu({ onSearchHistoryClick, variant = 'desktop' }: ProfileMenuProps) {
  const { isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  const handleSearchHistoryClick = () => {
    if (onSearchHistoryClick) {
      onSearchHistoryClick()
    }
    setIsOpen(false)
  }

  if (!isSignedIn) {
    // Show sign in button when not logged in
    if (variant === 'mobile') {
      return (
        <SignInButton mode="modal">
          <button
            type="button"
            className="flex flex-col items-center justify-center text-gray-500 hover:text-pink-500"
            aria-label="Sign In"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] mt-1">Login</span>
          </button>
        </SignInButton>
      )
    } else {
      return (
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
      )
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  // Show custom menu when logged in
  return (
    <div className="relative" ref={menuRef}>
      {variant === 'mobile' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-col items-center justify-center text-gray-500 hover:text-pink-500"
          aria-label="Profile"
        >
          {user?.imageUrl ? (
            <div className="w-6 h-6 rounded-full ring-2 ring-violet-300 overflow-hidden">
              <Image
                src={user.imageUrl}
                alt={user.fullName || 'Profile'}
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center ring-2 ring-violet-300">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="text-[10px] mt-1">Profile</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-full ring-2 ring-violet-300 hover:ring-pink-400 transition-all shadow-md hover:shadow-lg active:scale-95 overflow-hidden"
          aria-label="Profile"
          title="Profile Menu"
        >
          {user?.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={user.fullName || 'Profile'}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
        </button>
      )}

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[80]"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={cn(
              "absolute z-[90] bg-white rounded-xl shadow-2xl border border-violet-200 overflow-hidden min-w-[200px]",
              variant === 'mobile' ? "bottom-12 right-2" : "bottom-14 left-0"
            )}
          >
            <div className="py-2">
              <button
                onClick={handleSearchHistoryClick}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-violet-50 transition-colors text-left"
              >
                <Clock className="w-5 h-5 text-violet-600" />
                <span className="text-violet-900 font-medium">Search History</span>
              </button>
            </div>
            <div className="border-t border-violet-200">
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="text-red-700 font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

