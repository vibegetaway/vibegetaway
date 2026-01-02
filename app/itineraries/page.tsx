"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, MapPin, Trash2, Menu, X, Map, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { getItineraryHistory, deleteItineraryFromHistory } from "@/lib/itineraryHistory"
import type { SavedItinerary } from "@/types/itinerary"
import { MobileNav } from "@/components/MobileNav"
import { SignInButton, UserButton, useUser } from "@clerk/nextjs"
import Image from "next/image"

export default function ItinerariesPage() {
  const router = useRouter()
  const { isSignedIn } = useUser()
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([])
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    const history = getItineraryHistory()
    setItineraries(history)
  }, [])

  const handleItineraryClick = (itineraryId: string) => {
    router.push(`/quickstart?id=${itineraryId}`)
  }

  const handleDeleteItinerary = (e: React.MouseEvent, itineraryId: string) => {
    e.stopPropagation()
    
    if (confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      deleteItineraryFromHistory(itineraryId)
      const updatedHistory = getItineraryHistory()
      setItineraries(updatedHistory)
    }
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-chart-3/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-3xl" />
      </div>

      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 via-secondary/30 to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 relative">
            <button onClick={() => router.push("/")} className="flex items-center gap-2 group">
              <div className="h-8 sm:h-10 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Image
                  src="/assets/branding/banner.png"
                  alt="VibeGetaway"
                  width={200}
                  height={50}
                  className="h-full w-auto object-contain"
                />
              </div>
            </button>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3">
                {isSignedIn ? (
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10 rounded-full ring-2 ring-border/50 hover:ring-primary/50 transition-all shadow-sm",
                        userButtonPopoverCard: "shadow-2xl border border-border rounded-xl",
                      }
                    }}
                  />
                ) : (
                  <SignInButton mode="modal">
                    <button className="px-4 sm:px-5 py-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground text-sm font-semibold rounded-full transition-all duration-200 hover:scale-105 active:scale-95">
                      Sign In
                    </button>
                  </SignInButton>
                )}
              </div>

              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Menu"
              >
                {showMenu ? (
                  <X className="w-6 h-6 text-foreground" />
                ) : (
                  <Menu className="w-6 h-6 text-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Slide-in Menu */}
      {showMenu && (
        <div className="fixed inset-0 z-50 md:z-[60]">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute top-0 right-0 h-full w-80 bg-card border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Menu</h2>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-6">
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => {
                        router.push("/")
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors flex items-center gap-3"
                    >
                      <Map className="w-5 h-5" />
                      Home
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        router.push("/explore")
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-secondary/10 text-foreground hover:text-secondary transition-colors flex items-center gap-3"
                    >
                      <Sparkles className="w-5 h-5" />
                      Inspire
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        router.push("/itineraries")
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent/10 text-foreground hover:text-accent transition-colors flex items-center gap-3"
                    >
                      <Calendar className="w-5 h-5" />
                      My Trips
                    </button>
                  </li>
                  <li className="pt-4 mt-4 border-t border-border">
                    <button
                      onClick={() => {
                        router.push("/about")
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      About
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        router.push("/pricing")
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Pricing
                    </button>
                  </li>
                </ul>
              </nav>

              <div className="p-6 border-t border-border md:hidden">
                {isSignedIn ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Account</span>
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10 rounded-full ring-2 ring-border/50",
                          userButtonPopoverCard: "shadow-2xl border border-border rounded-xl",
                        }
                      }}
                    />
                  </div>
                ) : (
                  <SignInButton mode="modal">
                    <button
                      onClick={() => setShowMenu(false)}
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground py-3 rounded-xl font-semibold transition-all duration-200"
                    >
                      Sign In
                    </button>
                  </SignInButton>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        <div className="max-w-5xl mx-auto space-y-6">
          {itineraries.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center">
                <MapPin className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No trips yet</h2>
              <p className="text-muted-foreground mb-6">
                Start planning your first adventure!
              </p>
              <button
                onClick={() => router.push("/plan")}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Plan a Trip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {itineraries.map((itinerary) => (
                <div
                  key={itinerary.id}
                  onClick={() => handleItineraryClick(itinerary.id)}
                  className="group cursor-pointer bg-card backdrop-blur-sm rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 border border-border/50 relative"
                >
                  <button
                    onClick={(e) => handleDeleteItinerary(e, itinerary.id)}
                    className="absolute top-3 right-3 z-10 p-2 bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    title="Delete trip"
                    aria-label="Delete trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="relative h-48 overflow-hidden bg-muted">
                    {(() => {
                      const firstImageUrl = itinerary.generatedPlan[0]?.morning?.imageUrl || 
                                          itinerary.generatedPlan[0]?.midday?.imageUrl || 
                                          itinerary.generatedPlan[0]?.evening?.imageUrl
                      
                      return firstImageUrl ? (
                        <Image
                          src={firstImageUrl}
                          alt={itinerary.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-chart-3/20 flex items-center justify-center">
                          <MapPin className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )
                    })()}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/95 via-foreground/30 to-transparent" />
                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                      <h3 className="text-lg sm:text-xl font-bold text-background mb-1 text-balance drop-shadow-lg">
                        {itinerary.name || "Untitled Trip"}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-background/90 drop-shadow">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {itinerary.locations.length} {itinerary.locations.length === 1 ? "location" : "locations"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {itinerary.locations.slice(0, 3).map((location, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-secondary/10 text-secondary-foreground rounded-full border border-secondary/20"
                        >
                          {location.region}
                        </span>
                      ))}
                      {itinerary.locations.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                          +{itinerary.locations.length - 3} more
                        </span>
                      )}
                    </div>
                    <button className="w-full bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground text-sm font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <MobileNav activePage="itineraries" />
    </main>
  )
}

