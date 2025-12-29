"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, MapPin } from "lucide-react"
import { useEffect, useState } from "react"
import { getItineraryHistory, type SavedItinerary } from "@/lib/itineraryHistory"
import { MobileNav } from "@/components/MobileNav"
import Image from "next/image"

export default function ItinerariesPage() {
  const router = useRouter()
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([])

  useEffect(() => {
    const history = getItineraryHistory()
    setItineraries(history)
  }, [])

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-chart-3/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-3xl" />
      </div>

      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-chart-3/30 via-secondary/30 via-primary/30 to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 relative">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <h1 className="absolute left-1/2 -translate-x-1/2 text-lg sm:text-xl font-bold text-foreground">
              My Trips
            </h1>
          </div>
        </div>
      </nav>

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
                  onClick={() => router.push(`/plan/${itinerary.id}`)}
                  className="group cursor-pointer bg-card backdrop-blur-sm rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 border border-border/50"
                >
                  <div className="relative h-48 overflow-hidden bg-muted">
                    {itinerary.locations[0] ? (
                      <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-chart-3/20 flex items-center justify-center">
                        <MapPin className="w-12 h-12 text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-chart-3/20" />
                    )}
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

