"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Sparkles, Lock, Unlock, RefreshCw, Loader2, Navigation, X, Heart, Image as ImageIcon, ChevronDown, ChevronUp, BookmarkCheck } from "lucide-react"
import { Header } from "@/components/Header"
import { MobileNav } from "@/components/MobileNav"
import { useTypingAnimation } from "@/hooks/useTypingAnimation"
import { InspirationModal } from "@/components/InspirationModal"
import type { InspirationCard } from "@/components/SwipeCard"
import { saveQuickstartToHistory, updateItineraryById, getItineraryById } from "@/lib/itineraryHistory"
import { useRouter, useSearchParams } from "next/navigation"

interface TimeSlotActivity {
  title: string
  description: string
  reason: string
  imageUrl?: string
  imageUrls?: string[]
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activity, setActivity] = useState("")
  const [location, setLocation] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [savedItineraryId, setSavedItineraryId] = useState<string>("")
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
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null)
  const [isFormCollapsed, setIsFormCollapsed] = useState(false)
  const [citySuggestions, setCitySuggestions] = useState<Array<{ name: string; country: string; region?: string; regionName?: string; coordinates?: { lat: number; lng: number } }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchingCities, setSearchingCities] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [expandedSlots, setExpandedSlots] = useState<Record<TimeSlot, boolean>>({
    morning: false,
    midday: false,
    evening: false
  })

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      const savedItinerary = getItineraryById(id)
      if (savedItinerary && savedItinerary.generatedPlan.length > 0) {
        setSavedItineraryId(id)
        
        const plan = savedItinerary.generatedPlan[0]
        setLocation(plan.location)
        
        const itineraryName = savedItinerary.name
        const activityMatch = itineraryName.match(/^(.+) in /)
        if (activityMatch) {
          setActivity(activityMatch[1].toLowerCase())
        }
        
        const loadedItinerary: Itinerary = {
          morning: {
            title: plan.morning.activity,
            description: plan.morning.description.split(' ')[0] === plan.morning.activity 
              ? plan.morning.description.substring(plan.morning.activity.length).trim()
              : plan.morning.description,
            reason: '',
            imageUrl: plan.morning.imageUrl,
            imageUrls: plan.morning.imageUrls
          },
          midday: {
            title: plan.midday.activity,
            description: plan.midday.description.split(' ')[0] === plan.midday.activity
              ? plan.midday.description.substring(plan.midday.activity.length).trim()
              : plan.midday.description,
            reason: '',
            imageUrl: plan.midday.imageUrl,
            imageUrls: plan.midday.imageUrls
          },
          evening: {
            title: plan.evening.activity,
            description: plan.evening.description.split(' ')[0] === plan.evening.activity
              ? plan.evening.description.substring(plan.evening.activity.length).trim()
              : plan.evening.description,
            reason: '',
            imageUrl: plan.evening.imageUrl,
            imageUrls: plan.evening.imageUrls
          }
        }
        
        setItinerary(loadedItinerary)
        setIsFormCollapsed(true)
      }
    }
  }, [searchParams])

  const activityPlaceholder = useTypingAnimation({
    phrases: ACTIVITY_PHRASES,
    enabled: !activity
  })

  const searchCities = async (query: string): Promise<Array<{ name: string; country: string; region?: string; regionName?: string; coordinates?: { lat: number; lng: number } }>> => {
    if (!query.trim() || query.length < 2) {
      return []
    }

    try {
      const response = await fetch(`/api/city-search?q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        console.error('City search API error:', response.status)
        return []
      }

      const data = await response.json()

      if (data.error) {
        console.warn('City search API error:', data.error)
        return []
      }

      return data.suggestions || []
    } catch (error) {
      console.error('Error fetching cities from LocationIQ:', error)
      return []
    }
  }

  useEffect(() => {
    if (!location.trim() || location.length < 2) {
      setCitySuggestions([])
      setShowSuggestions(false)
      setHasSearched(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setSearchingCities(true)
      setHasSearched(false)
      try {
        const suggestions = await searchCities(location)
        setCitySuggestions(suggestions)
        setHasSearched(true)
        setShowSuggestions(true)
      } catch (error) {
        console.error('Error searching cities:', error)
        setCitySuggestions([])
        setHasSearched(true)
        setShowSuggestions(true)
      } finally {
        setSearchingCities(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [location])

  const handleCitySelect = (suggestion: { name: string; country: string; region?: string; regionName?: string; coordinates?: { lat: number; lng: number } }) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }

    const locationText = suggestion.region
      ? `${suggestion.name}, ${suggestion.country}`
      : `${suggestion.name}, ${suggestion.country}`

    setLocation(locationText)
    setShowSuggestions(false)
    setCitySuggestions([])
    setHasSearched(false)
  }

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
      const itineraryData = data.itinerary

      const itineraryWithImages = await Promise.all(
        (['morning', 'midday', 'evening'] as TimeSlot[]).map(async (slot) => {
          const activity = itineraryData[slot]
          try {
            const imageResponse = await fetch(
              `/api/pixabay-images?keywords=${encodeURIComponent(`${activity.title} ${location}`)}&limit=4`
            )
            if (imageResponse.ok) {
              const imageData = await imageResponse.json()
              const images = imageData.images || []
              return {
                ...activity,
                imageUrl: images[0]?.urls?.regular,
                imageUrls: images.map((img: any) => img.urls.regular).filter(Boolean)
              }
            }
          } catch (error) {
            console.error(`Error fetching image for ${slot}:`, error)
          }
          return activity
        })
      )

      const newItinerary = {
        morning: itineraryWithImages[0],
        midday: itineraryWithImages[1],
        evening: itineraryWithImages[2],
      }
      
      setItinerary(newItinerary)
      setIsFormCollapsed(true)

      const itineraryId = saveQuickstartToHistory(newItinerary, activity, location)
      setSavedItineraryId(itineraryId)
      
      if (itineraryId) {
        console.log('Trip automatically saved to history')
      }
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
      const itineraryData = { ...data.itinerary }
      if (itinerary) {
        if (lockedSlots.morning) itineraryData.morning = itinerary.morning
        if (lockedSlots.midday) itineraryData.midday = itinerary.midday
        if (lockedSlots.evening) itineraryData.evening = itinerary.evening
      }

      const itineraryWithImages = await Promise.all(
        (['morning', 'midday', 'evening'] as TimeSlot[]).map(async (slot) => {
          const activity = itineraryData[slot]
          if (activity.imageUrl) return activity
          try {
            const imageResponse = await fetch(
              `/api/pixabay-images?keywords=${encodeURIComponent(`${activity.title} ${location}`)}&limit=4`
            )
            if (imageResponse.ok) {
              const imageData = await imageResponse.json()
              const images = imageData.images || []
              return {
                ...activity,
                imageUrl: images[0]?.urls?.regular,
                imageUrls: images.map((img: any) => img.urls.regular).filter(Boolean)
              }
            }
          } catch (error) {
            console.error(`Error fetching image for ${slot}:`, error)
          }
          return activity
        })
      )

      const newItinerary = {
        morning: itineraryWithImages[0],
        midday: itineraryWithImages[1],
        evening: itineraryWithImages[2],
      }
      
      setItinerary(newItinerary)

      if (savedItineraryId) {
        updateItineraryById(savedItineraryId, newItinerary, activity, location)
        console.log('Trip updated in history')
      } else {
        const itineraryId = saveQuickstartToHistory(newItinerary, activity, location)
        setSavedItineraryId(itineraryId)
        console.log('Trip saved to history')
      }
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
      const newActivity = data.activity

      try {
        const imageResponse = await fetch(
          `/api/pixabay-images?keywords=${encodeURIComponent(`${newActivity.title} ${location}`)}&limit=4`
        )
        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          const images = imageData.images || []
          newActivity.imageUrl = images[0]?.urls?.regular
          newActivity.imageUrls = images.map((img: any) => img.urls.regular).filter(Boolean)
        }
      } catch (error) {
        console.error(`Error fetching image for ${slot}:`, error)
      }

      const updatedItinerary = {
        ...itinerary,
        [slot]: newActivity,
      }
      
      setItinerary(updatedItinerary)

      if (savedItineraryId) {
        updateItineraryById(savedItineraryId, updatedItinerary, activity, location)
        console.log('Trip updated in history (slot regenerated)')
      }
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
      const itineraryData = { ...data.itinerary }
      if (itinerary) {
        if (lockedSlots.morning) itineraryData.morning = itinerary.morning
        if (lockedSlots.midday) itineraryData.midday = itinerary.midday
        if (lockedSlots.evening) itineraryData.evening = itinerary.evening
      }

      const itineraryWithImages = await Promise.all(
        (['morning', 'midday', 'evening'] as TimeSlot[]).map(async (slot) => {
          const activity = itineraryData[slot]
          if (activity.imageUrl) return activity
          try {
            const imageResponse = await fetch(
              `/api/pixabay-images?keywords=${encodeURIComponent(`${activity.title} ${location}`)}&limit=4`
            )
            if (imageResponse.ok) {
              const imageData = await imageResponse.json()
              const images = imageData.images || []
              return {
                ...activity,
                imageUrl: images[0]?.urls?.regular,
                imageUrls: images.map((img: any) => img.urls.regular).filter(Boolean)
              }
            }
          } catch (error) {
            console.error(`Error fetching image for ${slot}:`, error)
          }
          return activity
        })
      )

      const newItinerary = {
        morning: itineraryWithImages[0],
        midday: itineraryWithImages[1],
        evening: itineraryWithImages[2],
      }
      
      setItinerary(newItinerary)

      if (savedItineraryId) {
        updateItineraryById(savedItineraryId, newItinerary, activity, location)
        console.log('Trip updated in history with preferences')
      } else {
        const itineraryId = saveQuickstartToHistory(newItinerary, activity, location)
        setSavedItineraryId(itineraryId)
        console.log('Trip saved to history with preferences')
      }
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
      const updatedItinerary = {
        ...itinerary,
        [detailView.slot]: alternative,
      }
      
      setItinerary(updatedItinerary)
      
      if (savedItineraryId) {
        updateItineraryById(savedItineraryId, updatedItinerary, activity, location)
        console.log('Trip updated in history (alternative selected)')
      }
      
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
            <div className="mb-8 sm:mb-12 text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Quick Day Planner
                </span>
              </h1>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-lg mb-8 overflow-hidden transition-all">
              {itinerary && (
                <button
                  onClick={() => setIsFormCollapsed(!isFormCollapsed)}
                  className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">
                      {activity && location ? `${activity} in ${location}` : 'Trip Details'}
                    </span>
                  </div>
                  {isFormCollapsed ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              )}
              <div className={`transition-all duration-300 ease-in-out ${isFormCollapsed && itinerary ? 'max-h-0 overflow-hidden' : 'max-h-[1000px]'}`}>
                <div className="p-6 sm:p-8 space-y-6">
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
                          onFocus={() => {
                            if (blurTimeoutRef.current) {
                              clearTimeout(blurTimeoutRef.current)
                              blurTimeoutRef.current = null
                            }
                            if (location.length >= 2) {
                              setShowSuggestions(true)
                            }
                          }}
                          onBlur={() => {
                            blurTimeoutRef.current = setTimeout(() => {
                              setShowSuggestions(false)
                            }, 200)
                          }}
                          placeholder="e.g., Bali, New York, Tokyo..."
                          className="w-full pl-12 pr-4 py-3.5 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                          disabled={isGenerating || isLocating}
                        />
                        {showSuggestions && location.length >= 2 && (
                          <div
                            className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto"
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            {searchingCities ? (
                              <div className="p-3 text-center text-sm text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
                                Searching...
                              </div>
                            ) : hasSearched && citySuggestions.length === 0 ? (
                              <div className="p-3 text-center text-sm text-muted-foreground">
                                No results found for "{location}"
                              </div>
                            ) : citySuggestions.length > 0 ? (
                              citySuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleCitySelect(suggestion)}
                                  className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors border-b border-border last:border-b-0"
                                >
                                  <div className="font-medium text-foreground">{suggestion.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {suggestion.region ? `${suggestion.region}, ${suggestion.country}` : suggestion.country}
                                  </div>
                                </button>
                              ))
                            ) : null}
                          </div>
                        )}
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
                        Plan My Day
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {itinerary && (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                      Your Day Plan
                    </h2>
                    {savedItineraryId && (
                      <button
                        onClick={() => router.push('/itineraries')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-all text-sm"
                        title="View all saved trips"
                      >
                        <BookmarkCheck className="w-4 h-4" />
                        <span className="hidden sm:inline">Saved</span>
                      </button>
                    )}
                  </div>
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
                              className={`p-2 rounded-lg transition-all hover:scale-110 ${lockedSlots[slot]
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

                        <div className="space-y-3">
                          <div>
                            <h4 className="text-base sm:text-lg font-bold text-foreground mb-2">
                              {itinerary[slot].title}
                            </h4>
                            <div className={`text-xs sm:text-sm text-foreground/70 leading-relaxed transition-all ${expandedSlots[slot] ? '' : 'line-clamp-2'}`}>
                              {itinerary[slot].description} {itinerary[slot].reason}
                            </div>
                            <button
                              onClick={() => setExpandedSlots(prev => ({ ...prev, [slot]: !prev[slot] }))}
                              className="text-xs font-semibold text-primary mt-1 hover:underline"
                            >
                              {expandedSlots[slot] ? 'Show less' : 'Read more'}
                            </button>
                          </div>

                          {itinerary[slot].imageUrls && itinerary[slot].imageUrls!.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mt-3">
                              {itinerary[slot].imageUrls!.slice(0, 4).map((imageUrl, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedImage({ url: imageUrl, title: itinerary[slot].title })
                                  }}
                                  className="relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-all group"
                                >
                                  <img
                                    src={imageUrl}
                                    alt={`${itinerary[slot].title} ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <ImageIcon className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}

                          <button
                            onClick={() => openDetailView(slot, itinerary[slot])}
                            className="text-xs font-semibold text-primary hover:translate-x-1 transition-transform inline-flex items-center gap-1 mt-2"
                          >
                            See alternatives →
                          </button>
                        </div>
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

        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl w-full max-h-[90vh]">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors z-10"
                aria-label="Close"
              >
                <X className="w-8 h-8" />
              </button>
              <div className="bg-card rounded-2xl overflow-hidden">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                <div className="p-4 border-t border-border">
                  <h3 className="text-lg font-bold text-foreground">{selectedImage.title}</h3>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <MobileNav hidePlanButton={true} />
    </>
  )
}
