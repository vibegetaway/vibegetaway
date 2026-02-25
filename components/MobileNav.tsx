'use client'

import { useRouter } from "next/navigation"
import { Home, Sparkles, Plus, BookOpen } from "lucide-react"
import { SignInButton, UserButton, useUser } from "@clerk/nextjs"

interface MobileNavProps {
  activePage?: 'home' | 'search' | 'plan' | 'itineraries' | 'explore'
  hidePlanButton?: boolean
}

export function MobileNav({ activePage, hidePlanButton = false }: MobileNavProps) {
  const router = useRouter()
  const { isSignedIn } = useUser()

  return (
    <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 pointer-events-none flex justify-center">
      <div className="pointer-events-auto bg-background/80 backdrop-blur-md border border-white/20 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 max-w-[90%] mx-4">
        {/* Home */}
        <button
          onClick={() => router.push("/")}
          aria-label="Home"
          aria-current={activePage === 'home' ? 'page' : undefined}
          className={`flex flex-col items-center gap-0.5 transition-all duration-200 active:scale-90 ${activePage === 'home'
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <Home className="w-5 h-5" strokeWidth={2.5} />
        </button>

        {/* Search */}
        <button
          onClick={() => router.push("/search")}
          aria-label="Search"
          aria-current={activePage === 'search' ? 'page' : undefined}
          className={`flex flex-col items-center gap-0.5 transition-all duration-200 active:scale-90 ${activePage === 'search'
            ? 'text-secondary'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <Sparkles className="w-5 h-5" strokeWidth={2.5} />
        </button>

        {/* Create Day Trip - Central Pulse Button */}
        {!hidePlanButton && (
          <button
            onClick={() => router.push("/plan")}
            aria-label="Create Day Trip"
            aria-current={activePage === 'plan' ? 'page' : undefined}
            className="flex flex-col items-center -mt-8"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30 flex items-center justify-center border-2 border-background active:scale-90 transition-transform hover:scale-105">
              <Plus className="w-6 h-6 text-primary-foreground" strokeWidth={3} />
            </div>
          </button>
        )}

        {/* Itineraries History */}
        <button
          onClick={() => router.push("/itineraries")}
          aria-label="My Trips"
          aria-current={activePage === 'itineraries' ? 'page' : undefined}
          className={`flex flex-col items-center gap-0.5 transition-all duration-200 active:scale-90 ${activePage === 'itineraries'
            ? 'text-accent'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <BookOpen className="w-5 h-5" strokeWidth={2.5} />
        </button>

        {/* Account */}
        <div className="flex flex-col items-center">
          {isSignedIn ? (
            <div className="scale-75 origin-center">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-full ring-2 ring-border/50 transition-all hover:ring-primary/50",
                    userButtonPopoverCard: "shadow-xl border border-border rounded-xl mb-4",
                  }
                }}
              />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button
                aria-label="Sign In"
                className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-90"
              >
                <div className="w-6 h-6 bg-secondary/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                </div>
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </div>
  )
}

