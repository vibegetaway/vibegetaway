'use client'

import { useRouter } from "next/navigation"
import { Home, Sparkles, Plus, BookOpen } from "lucide-react"
import { SignInButton, UserButton, useUser } from "@clerk/nextjs"

interface MobileNavProps {
  activePage?: 'home' | 'inspire' | 'plan' | 'itineraries'
  hidePlanButton?: boolean
}

export function MobileNav({ activePage, hidePlanButton = false }: MobileNavProps) {
  const router = useRouter()
  const { isSignedIn } = useUser()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-inset-bottom shadow-lg">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-chart-3/40 via-secondary/40 to-primary/40" />
      <div className="flex items-end justify-around px-2 py-3 relative">
        {/* Home */}
        <button
          onClick={() => router.push("/")}
          className={`group flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 flex-1 ${
            activePage === 'home'
              ? 'bg-chart-3/20 text-chart-3'
              : 'hover:bg-chart-3/15 active:bg-chart-3/20'
          } active:scale-95`}
        >
          <Home className={`w-5 h-5 transition-transform group-hover:scale-110 ${
            activePage === 'home' ? 'text-chart-3' : 'text-chart-3'
          }`} />
          <span className="text-xs text-muted-foreground">Home</span>
        </button>

        {/* Inspire */}
        <button
          onClick={() => router.push("/inspire")}
          className={`group flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 flex-1 ${
            activePage === 'inspire'
              ? 'bg-secondary/20 text-secondary'
              : 'hover:bg-secondary/15 active:bg-secondary/20'
          } active:scale-95`}
        >
          <Sparkles className={`w-5 h-5 transition-transform group-hover:scale-110 ${
            activePage === 'inspire' ? 'text-secondary' : 'text-secondary'
          }`} />
          <span className="text-xs text-muted-foreground">Inspire</span>
        </button>

        {/* Create Day Trip - Elevated Center Button - Only shown on home page */}
        {!hidePlanButton && (
          <button
            onClick={() => router.push("/plan")}
            className="flex flex-col items-center -mt-6 flex-1"
          >
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary via-secondary to-chart-3 shadow-2xl flex items-center justify-center border-2 border-primary/40 active:scale-95 transition-transform hover:shadow-[0_0_30px_rgba(120,119,198,0.6)] hover:scale-105 ring-4 ring-primary/20">
              <Plus className="w-7 h-7 text-primary-foreground relative z-10 drop-shadow-lg" strokeWidth={2.5} />
            </div>
            <span className="text-xs text-muted-foreground mt-1">Plan</span>
          </button>
        )}

        {/* Itineraries History */}
        <button
          onClick={() => router.push("/itineraries")}
          className={`group flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 flex-1 ${
            activePage === 'itineraries'
              ? 'bg-primary/20 text-primary'
              : 'hover:bg-primary/15 active:bg-primary/20'
          } active:scale-95`}
        >
          <BookOpen className={`w-5 h-5 transition-transform group-hover:scale-110 ${
            activePage === 'itineraries' ? 'text-primary' : 'text-primary'
          }`} />
          <span className="text-xs text-muted-foreground">Trips</span>
        </button>

        {/* Account */}
        <div className="flex flex-col items-center flex-1">
          {isSignedIn ? (
            <div className="flex flex-col items-center gap-1">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 rounded-full ring-2 ring-border/50 transition-all shadow-sm hover:ring-secondary/50 hover:scale-110 active:scale-95",
                    userButtonPopoverCard: "shadow-2xl border border-border rounded-xl mb-16",
                  }
                }}
              />
              <span className="text-xs text-muted-foreground">Account</span>
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="flex flex-col items-center gap-1 rounded-lg hover:bg-secondary/15 active:bg-secondary/20 active:scale-95 transition-all duration-200">
                <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center shadow-sm hover:bg-secondary/30 transition-colors">
                  <svg className="w-5 h-5 text-secondary-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                </div>
                <span className="text-xs text-muted-foreground">Account</span>
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </div>
  )
}

