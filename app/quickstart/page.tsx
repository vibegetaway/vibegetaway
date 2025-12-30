"use client"

import { useState } from "react"
import { MapPin, Sparkles, Lock, Unlock, RefreshCw, Loader2, Navigation, X, Heart } from "lucide-react"
import { Header } from "@/components/Header"
import { MobileNav } from "@/components/MobileNav"
import { useTypingAnimation } from "@/hooks/useTypingAnimation"
import { InspirationModal } from "@/components/InspirationModal"
import type { InspirationCard } from "@/components/SwipeCard"

interface TimeSlotActivity {
  title: string
  description: string
  reason: string
}

interface Itinerary {
  morning: TimeSlotActivity
  midday: TimeSlotActivity
  evening: TimeSlotActivity
}

type TimeSlot = 'morning' | 'midday' | 'evening'

interface LockedSlots {
  morning: boolean
  midday: boolean
  evening: boolean
}

const ACTIVITY_PHRASES = [
  "swimming",
  "surfing",
  "hiking",
  "dancing",
  "exploring museums",
  "trying local food",
  "photography",
  "rock climbing",
  "yoga and meditation",
  "wine tasting"
]

export default function QuickStart() {
  const [activity, setActivity] = useState("")
  const [location, setLocation] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [lockedSlots, setLockedSlots] = useState<LockedSlots>({
    morning: false,
    midday: false,
    evening: false,
  })
  const [regeneratingSlot, setRegeneratingSlot] = useState<TimeSlot | null>(null)
  const [detailView, setDetailView] = useState<{
    slot: TimeSlot
    activity: TimeSlotActivity
  } | null>(null)
  const [alternatives, setAlternatives] = useState<TimeSlotActivity[]>([])
  const [loadingAlternatives, setLoadingAlternatives] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [showInspirationModal, setShowInspirationModal] = useState(false)

  const activityPlaceholder = useTypingAnimation({
    phrases: ACTIVITY_PHRASES,
    enabled: !activity
  })

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          )
          const data = await response.json()
          
          const locationName = data.address?.city || 
                              data.address?.town || 
                              data.address?.village || 
                              data.address?.state || 
                              data.address?.country || 
                              "Unknown Location"
          
          setLocation(locationName)
        } catch (error) {
          console.error("Error getting location name:", error)
          setLocation(`${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`)
        } finally {
          setIsLocating(false)
        }
      },
      (error) => {
        console.error("Error getting location:", error)
        alert("Unable to get your location. Please enter it manually.")
        setIsLocating(false)
      }
    )
  }

  const generateItinerary = async () => {
    if (!activity.trim() || !location.trim()) {
      alert("Please enter both an activity and location")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/quickstart-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity, location }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate itinerary")
      }

      const data = await response.json()
      setItinerary(data.itinerary)
    } catch (error) {
      console.error("Error generating itinerary:", error)
      alert("Failed to generate itinerary. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const regenerateFullDay = async () => {
    if (!activity.trim() || !location.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/quickstart-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          activity, 
          location,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to regenerate itinerary")
      }

      const data = await response.json()
      
      const newItinerary = { ...data.itinerary }
      if (itinerary) {
        if (lockedSlots.morning) newItinerary.morning = itinerary.morning
        if (lockedSlots.midday) newItinerary.midday = itinerary.midday
        if (lockedSlots.evening) newItinerary.evening = itinerary.evening
      }
      
      setItinerary(newItinerary)
    } catch (error) {
      console.error("Error regenerating itinerary:", error)
      alert("Failed to regenerate itinerary. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const regenerateSlot = async (slot: TimeSlot) => {
    if (!itinerary || !activity.trim() || !location.trim()) return

    setRegeneratingSlot(slot)
    try {
      const response = await fetch("/api/quickstart-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity,
          location,
          regenerateSlot: slot,
          currentItinerary: itinerary,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to regenerate slot")
      }

      const data = await response.json()
      setItinerary({
        ...itinerary,
        [slot]: data.activity,
      })
    } catch (error) {
      console.error("Error regenerating slot:", error)
      alert("Failed to regenerate activity. Please try again.")
    } finally {
      setRegeneratingSlot(null)
    }
  }

  const toggleLock = (slot: TimeSlot) => {
    setLockedSlots({
      ...lockedSlots,
      [slot]: !lockedSlots[slot],
    })
  }

  const regenerateWithPreferences = async (liked: InspirationCard[], superliked: InspirationCard[]) => {
    if (!activity.trim() || !location.trim()) return

    const preferenceContext = [
      ...superliked.map(c => `LOVE: ${c.title} at ${c.location}`),
      ...liked.map(c => `LIKE: ${c.title} at ${c.location}`),
    ].join('; ')

    setIsGenerating(true)
    try {
      const enhancedActivity = preferenceContext 
        ? `${activity} (User preferences: ${preferenceContext})`
        : activity

      const response = await fetch("/api/quickstart-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          activity: enhancedActivity, 
          location,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to regenerate itinerary")
      }

      const data = await response.json()
      
      const newItinerary = { ...data.itinerary }
      if (itinerary) {
        if (lockedSlots.morning) newItinerary.morning = itinerary.morning
        if (lockedSlots.midday) newItinerary.midday = itinerary.midday
        if (lockedSlots.evening) newItinerary.evening = itinerary.evening
      }
      
      setItinerary(newItinerary)
    } catch (error) {
      console.error("Error regenerating itinerary with preferences:", error)
      alert("Failed to regenerate itinerary. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const openDetailView = async (slot: TimeSlot, activityData: TimeSlotActivity) => {
    setDetailView({ slot, activity: activityData })
    setLoadingAlternatives(true)
    
    try {
      const response = await fetch("/api/quickstart-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity,
          location,
          getAlternatives: true,
          targetSlot: slot,
          currentItinerary: itinerary,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get alternatives")
      }

      const data = await response.json()
      setAlternatives(data.alternatives || [])
    } catch (error) {
      console.error("Error getting alternatives:", error)
      setAlternatives([])
    } finally {
      setLoadingAlternatives(false)
    }
  }

  const selectAlternative = (alternative: TimeSlotActivity) => {
    if (detailView && itinerary) {
      setItinerary({
        ...itinerary,
        [detailView.slot]: alternative,
      })
      setDetailView(null)
      setAlternatives([])
    }
  }

  const getTimeSlotIcon = (slot: TimeSlot) => {
    switch (slot) {
      case 'morning':
        return '🌅'
      case 'midday':
        return '☀️'
      case 'evening':
        return '🌙'
    }
  }

  const getTimeSlotTime = (slot: TimeSlot) => {
    switch (slot) {
      case 'morning':
        return '8:00 AM - 12:00 PM'
      case 'midday':
        return '12:00 PM - 5:00 PM'
      case 'evening':
        return '5:00 PM - 10:00 PM'
    }
  }

  const getSlotGradient = (slot: TimeSlot) => {
    switch (slot) {
      case 'morning':
        return 'from-primary/10 to-primary/5'
      case 'midday':
        return 'from-secondary/10 to-secondary/5'
      case 'evening':
        return 'from-accent/10 to-accent/5'
    }
  }

  const getSlotBorder = (slot: TimeSlot) => {
    switch (slot) {
      case 'morning':
        return 'border-primary/30'
      case 'midday':
        return 'border-secondary/30'
      case 'evening':
        return 'border-accent/30'
    }
  }

  const getSlotAccent = (slot: TimeSlot) => {
    switch (slot) {
      case 'morning':
        return 'text-primary'
      case 'midday':
        return 'text-secondary'
      case 'evening':
        return 'text-accent'
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pb-24 md:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-5xl mx-auto">
          <div className="mb-8 sm:mb-12 text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Quick Day Planner
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Tell us what you want to do, and we'll plan your perfect day
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-lg mb-8 space-y-6">
            <div className="space-y-2">
              <label htmlFor="activity" className="block text-sm font-semibold text-foreground">
                What do you want to do? <span className="text-secondary">*</span>
              </label>
              <div className="relative">
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none z-10" />
                <input
                  id="activity"
                  type="text"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder=""
                  className="w-full pl-12 pr-4 py-3.5 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  disabled={isGenerating}
                />
                {!activity && activityPlaceholder && (
                  <div className="absolute left-12 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground z-[5]">
                    {activityPlaceholder}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-semibold text-foreground">
                Where are you? <span className="text-secondary">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary pointer-events-none z-10" />
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Bali, New York, Tokyo..."
                    className="w-full pl-12 pr-4 py-3.5 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                    disabled={isGenerating || isLocating}
                  />
                </div>
                <button
                  onClick={handleGeolocation}
                  disabled={isGenerating || isLocating}
                  className="px-4 py-3.5 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
                >
                  {isLocating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Navigation className="w-5 h-5" />
                  )}
                  <span className="hidden sm:inline">Use My Location</span>
                </button>
              </div>
            </div>

            <button
              onClick={generateItinerary}
              disabled={isGenerating || !activity.trim() || !location.trim()}
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating Your Day...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate My Day
                </>
              )}
            </button>
          </div>

          {itinerary && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Your Day Plan
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={regenerateFullDay}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Regenerate All</span>
                    <span className="sm:hidden">Regenerate</span>
                  </button>
                  <button
                    onClick={() => setShowInspirationModal(true)}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-90 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    <Heart className="w-4 h-4" />
                    <span className="hidden sm:inline">Get Inspired</span>
                    <span className="sm:hidden">Inspire</span>
                  </button>
                </div>
              </div>

              <div className="grid gap-6">
                {(['morning', 'midday', 'evening'] as TimeSlot[]).map((slot) => (
                  <div
                    key={slot}
                    className={`relative bg-gradient-to-br ${getSlotGradient(slot)} rounded-2xl border ${getSlotBorder(slot)} shadow-md overflow-hidden transition-all hover:shadow-xl`}
                  >
                    <div className="p-6 sm:p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{getTimeSlotIcon(slot)}</span>
                          <div>
                            <h3 className={`text-xl sm:text-2xl font-bold capitalize ${getSlotAccent(slot)}`}>
                              {slot}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {getTimeSlotTime(slot)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleLock(slot)}
                            className={`p-2 rounded-lg transition-all hover:scale-110 ${
                              lockedSlots[slot]
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                            title={lockedSlots[slot] ? 'Unlock' : 'Lock'}
                          >
                            {lockedSlots[slot] ? (
                              <Lock className="w-5 h-5" />
                            ) : (
                              <Unlock className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => regenerateSlot(slot)}
                            disabled={regeneratingSlot === slot || lockedSlots[slot]}
                            className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Regenerate this slot"
                          >
                            <RefreshCw className={`w-5 h-5 ${regeneratingSlot === slot ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => openDetailView(slot, itinerary[slot])}
                        className="w-full text-left group"
                      >
                        <div className="space-y-3">
                          <h4 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {itinerary[slot].title}
                          </h4>
                          <p className="text-foreground/80 leading-relaxed">
                            {itinerary[slot].description}
                          </p>
                          <div className="flex items-start gap-2 p-3 bg-card/50 rounded-lg border border-border/50">
                            <Sparkles className={`w-4 h-4 mt-0.5 flex-shrink-0 ${getSlotAccent(slot)}`} />
                            <p className="text-sm text-muted-foreground italic">
                              {itinerary[slot].reason}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                            Click to see alternatives →
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {detailView && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setDetailView(null)
            setAlternatives([])
          }}
        >
          <div
            className="bg-card rounded-2xl border border-border shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-start justify-between z-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{getTimeSlotIcon(detailView.slot)}</span>
                  <h3 className={`text-2xl font-bold capitalize ${getSlotAccent(detailView.slot)}`}>
                    {detailView.slot}
                  </h3>
                </div>
                <h4 className="text-xl font-bold text-foreground">
                  {detailView.activity.title}
                </h4>
              </div>
              <button
                onClick={() => {
                  setDetailView(null)
                  setAlternatives([])
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <p className="text-foreground leading-relaxed">
                  {detailView.activity.description}
                </p>
                <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-lg">
                  <Sparkles className={`w-5 h-5 mt-0.5 flex-shrink-0 ${getSlotAccent(detailView.slot)}`} />
                  <p className="text-sm text-muted-foreground italic">
                    {detailView.activity.reason}
                  </p>
                </div>
              </div>

              <div>
                <h5 className="text-lg font-bold text-foreground mb-4">
                  Alternative Suggestions
                </h5>
                
                {loadingAlternatives ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : alternatives.length > 0 ? (
                  <div className="space-y-3">
                    {alternatives.map((alt, index) => (
                      <button
                        key={index}
                        onClick={() => selectAlternative(alt)}
                        className="w-full text-left p-4 bg-gradient-to-br from-muted/50 to-muted/30 hover:from-primary/10 hover:to-secondary/10 rounded-xl border border-border hover:border-primary/50 transition-all group"
                      >
                        <h6 className="font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                          {alt.title}
                        </h6>
                        <p className="text-sm text-foreground/70 mb-2">
                          {alt.description}
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                          {alt.reason}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No alternatives available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <InspirationModal
        isOpen={showInspirationModal}
        onClose={() => setShowInspirationModal(false)}
        activity={activity}
        location={location}
        onRegenerateWithPreferences={regenerateWithPreferences}
      />
      </main>
      <MobileNav hidePlanButton={true} />
    </>
  )
}
