"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { MapPin, Sparkles, Lock, Unlock, RefreshCw, Loader2, Navigation, X, Heart, Image as ImageIcon, ChevronDown, ChevronUp, BookmarkCheck, CalendarDays, Plus, Trash2 } from "lucide-react"
import { Header } from "@/components/Header"
import { MobileNav } from "@/components/MobileNav"
import { useTypingAnimation } from "@/hooks/useTypingAnimation"
import { InspirationModal } from "@/components/inspiration/InspirationModal"
import type { InspirationCard } from "@/components/SwipeCard"
import { saveItineraryToHistory, getItineraryById, getItineraryHistory, deleteItineraryFromHistory } from "@/lib/itineraryHistory"
import type { DayBreakdown } from "@/lib/itineraryHistory"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from 'next/dynamic'
import type { Destination } from "@/lib/generateDestinationInfo"

const TripMap = dynamic(() => import('@/components/TripMap'), { ssr: false })

interface TimeSlotActivity {
  title: string
  description: string
  reason: string
  imageUrl?: string
  imageUrls?: string[]
}

interface DayItinerary {
  day: number
  location: string
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

function PlanContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activity, setActivity] = useState("")
  const [locations, setLocations] = useState<string[]>([""])
  const [tripDuration, setTripDuration] = useState(3)
  const [isGenerating, setIsGenerating] = useState(false)
  const [itineraries, setItineraries] = useState<DayItinerary[]>([])
  const [selectedDayTab, setSelectedDayTab] = useState(1)
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
  const [activeLocationIndex, setActiveLocationIndex] = useState(0)
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [expandedSlots, setExpandedSlots] = useState<Record<TimeSlot, boolean>>({
    morning: false,
    midday: false,
    evening: false
  })
  const [savedLocations, setSavedLocations] = useState<Destination[]>([])

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      const savedItinerary = getItineraryById(id)
      if (savedItinerary && savedItinerary.generatedPlan.length > 0) {
        setSavedItineraryId(id)
        setSavedLocations(savedItinerary.locations)
        setTripDuration(savedItinerary.tripDuration)

        const itineraryName = savedItinerary.name
        const activityMatch = itineraryName.match(/^(.+) in /)
        if (activityMatch) {
          setActivity(activityMatch[1].toLowerCase())
        }

        const loadedItineraries: DayItinerary[] = savedItinerary.generatedPlan.map((plan: DayBreakdown, index: number) => ({
          day: index + 1,
          location: plan.location,
          morning: {
            title: plan.morning.activity,
            description: plan.morning.description,
            reason: '',
            imageUrl: plan.morning.imageUrl,
            imageUrls: plan.morning.imageUrls
          },
          midday: {
            title: plan.midday.activity,
            description: plan.midday.description,
            reason: '',
            imageUrl: plan.midday.imageUrl,
            imageUrls: plan.midday.imageUrls
          },
          evening: {
            title: plan.evening.activity,
            description: plan.evening.description,
            reason: '',
            imageUrl: plan.evening.imageUrl,
            imageUrls: plan.evening.imageUrls
          }
        }))

        setItineraries(loadedItineraries)
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
    const currentLocation = locations[activeLocationIndex]
    if (!currentLocation?.trim() || currentLocation.length < 2) {
      setCitySuggestions([])
      setShowSuggestions(false)
      setHasSearched(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setSearchingCities(true)
      setHasSearched(false)
      try {
        const suggestions = await searchCities(currentLocation)
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
  }, [locations, activeLocationIndex])

  const handleCitySelect = (suggestion: { name: string; country: string; region?: string; regionName?: string; coordinates?: { lat: number; lng: number } }) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }

    const newLocations = [...locations]
    newLocations[activeLocationIndex] = suggestion.name
    setLocations(newLocations)

    setShowSuggestions(false)
  }

  const handleGeolocation = async () => {
    setIsLocating(true)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true,
        })
      })

      const { latitude, longitude } = position.coords
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}\u0026lon=${longitude}\u0026format=json`)
      const data = await response.json()

      const city = data.address.city || data.address.town || data.address.village || data.address.county || "Unknown Location"
      const newLocations = [...locations]
      newLocations[activeLocationIndex] = city
      setLocations(newLocations)
    } catch (error) {
      console.error('Geolocation error:', error)
      alert('Could not detect your location. Please enter it manually.')
    } finally {
      setIsLocating(false)
    }
  }

  const addLocation = () => {
    setLocations([...locations, ""])
    setTripDuration(tripDuration + 1)
  }

  const removeLocation = (index: number) => {
    if (locations.length > 1) {
      const newLocations = locations.filter((_, i) => i !== index)
      setLocations(newLocations)
      setTripDuration(tripDuration - 1)
    }
  }

  const updateLocation = (index: number, value: string) => {
    const newLocations = [...locations]
    newLocations[index] = value
    setLocations(newLocations)
  }

  const convertToDestinations = (locationStrings: string[]): Destination[] => {
    return locationStrings.map(loc => {
      const parts = loc.split(',').map(s => s.trim())
      if (parts.length >= 2) {
        return { region: parts[0], country: parts[parts.length - 1] }
      }
      return { region: loc, country: '' }
    })
  }

  const generateItineraryName = (activity: string, locations: string[]): string => {
    const firstLocation = locations[0]?.split(',')[0] || ''
    if (locations.length === 1) {
      return activity
        ? `${activity.charAt(0).toUpperCase() + activity.slice(1)} in ${firstLocation}`
        : `Trip to ${firstLocation}`
    }
    return activity
      ? `${activity.charAt(0).toUpperCase() + activity.slice(1)} - ${locations.length} Days`
      : `${locations.length}-Day Trip`
  }

  const convertToDayBreakdowns = (itineraries: DayItinerary[]): DayBreakdown[] => {
    return itineraries.map(day => ({
      day: day.day,
      location: day.location,
      morning: {
        activity: day.morning.title,
        description: `${day.morning.description} ${day.morning.reason || ''}`.trim(),
        imageUrl: day.morning.imageUrl,
        imageUrls: day.morning.imageUrls
      },
      midday: {
        activity: day.midday.title,
        description: `${day.midday.description} ${day.midday.reason || ''}`.trim(),
        imageUrl: day.midday.imageUrl,
        imageUrls: day.midday.imageUrls
      },
      evening: {
        activity: day.evening.title,
        description: `${day.evening.description} ${day.evening.reason || ''}`.trim(),
        imageUrl: day.evening.imageUrl,
        imageUrls: day.evening.imageUrls
      }
    }))
  }

  const generateItinerary = async () => {
    if (!activity.trim() || locations.some(loc => !loc.trim())) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/plan-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity,
          locations: locations.filter(loc => loc.trim()),
          tripDuration,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate itinerary")
      }

      const data = await response.json()

      const itinerariesWithImages = await Promise.all(
        data.plan.map(async (dayPlan: any, dayIndex: number) => {
          const morning = await fetchImages(dayPlan.morning.activity, locations[dayIndex])
          const midday = await fetchImages(dayPlan.midday.activity, locations[dayIndex])
          const evening = await fetchImages(dayPlan.evening.activity, locations[dayIndex])

          return {
            day: dayIndex + 1,
            location: dayPlan.location,
            morning: { ...dayPlan.morning, ...morning },
            midday: { ...dayPlan.midday, ...midday },
            evening: { ...dayPlan.evening, ...evening }
          }
        })
      )

      setItineraries(itinerariesWithImages)
      setIsFormCollapsed(true)

      const destinationData = convertToDestinations(locations.filter(loc => loc.trim()))
      const itineraryName = generateItineraryName(activity, locations.filter(loc => loc.trim()))
      const dayBreakdowns = convertToDayBreakdowns(itinerariesWithImages)

      const itineraryId = saveItineraryToHistory(destinationData, tripDuration, dayBreakdowns, itineraryName)
      setSavedItineraryId(itineraryId)
      setSavedLocations(destinationData)
    } catch (error) {
      console.error("Error generating itinerary:", error)
      alert("Failed to generate itinerary. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const fetchImages = async (activityTitle: string, location: string) => {
    try {
      const imageResponse = await fetch(
        `/api/pixabay-images?keywords=${encodeURIComponent(`${activityTitle} ${location}`)}&limit=4`
      )
      if (imageResponse.ok) {
        const imageData = await imageResponse.json()
        const images = imageData.images || []
        return {
          imageUrl: images[0]?.urls?.regular,
          imageUrls: images.map((img: any) => img.urls?.regular).filter(Boolean)
        }
      }
    } catch (error) {
      console.error(`Error fetching images:`, error)
    }
    return { imageUrl: undefined, imageUrls: [] }
  }

  const regenerateFullDay = async () => {
    if (!activity.trim() || locations.some(loc => !loc.trim())) return

    setIsGenerating(true)
    try {
      await generateItinerary()
    } catch (error) {
      console.error("Error regenerating itinerary:", error)
      alert("Failed to regenerate itinerary. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const regenerateSlot = async (slot: TimeSlot) => {
    const currentDay = itineraries[selectedDayTab - 1]
    if (!currentDay || !activity.trim() || lockedSlots[slot]) return

    setRegeneratingSlot(slot)
    try {
      const response = await fetch("/api/quickstart-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity,
          location: currentDay.location,
          regenerateSlot: slot,
          currentItinerary: {
            morning: currentDay.morning,
            midday: currentDay.midday,
            evening: currentDay.evening
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to regenerate slot")
      }

      const data = await response.json()
      const newActivity = data.activity

      const images = await fetchImages(newActivity.title, currentDay.location)
      newActivity.imageUrl = images.imageUrl
      newActivity.imageUrls = images.imageUrls

      const updatedItineraries = itineraries.map((day, index) => {
        if (index === selectedDayTab - 1) {
          return {
            ...day,
            [slot]: newActivity
          }
        }
        return day
      })

      setItineraries(updatedItineraries)

      if (savedItineraryId) {
        const history = getItineraryHistory()
        const existing = history.find(item => item.id === savedItineraryId)
        if (existing) {
          const dayBreakdowns = convertToDayBreakdowns(updatedItineraries)
          const destinationData = convertToDestinations(locations.filter(loc => loc.trim()))
          const itineraryName = generateItineraryName(activity, locations.filter(loc => loc.trim()))

          deleteItineraryFromHistory(savedItineraryId)
          const newId = saveItineraryToHistory(destinationData, tripDuration, dayBreakdowns, itineraryName)
          setSavedItineraryId(newId)
        }
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
    if (!activity.trim() || locations.some(loc => !loc.trim())) return

    const preferenceContext = [
      ...superliked.map(c => `LOVE: ${c.title} at ${c.location}`),
      ...liked.map(c => `LIKE: ${c.title} at ${c.location}`),
    ].join('; ')

    setIsGenerating(true)
    try {
      const enhancedActivity = preferenceContext
        ? `${activity} (User preferences: ${preferenceContext})`
        : activity

      const response = await fetch("/api/plan-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity: enhancedActivity,
          locations: locations.filter(loc => loc.trim()),
          tripDuration,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to regenerate itinerary")
      }

      const data = await response.json()

      const itinerariesWithImages = await Promise.all(
        data.plan.map(async (dayPlan: any, dayIndex: number) => {
          const lockedDay = itineraries[dayIndex]
          const morning = lockedSlots.morning && lockedDay ? lockedDay.morning : { ...dayPlan.morning, ...(await fetchImages(dayPlan.morning.activity, locations[dayIndex])) }
          const midday = lockedSlots.midday && lockedDay ? lockedDay.midday : { ...dayPlan.midday, ...(await fetchImages(dayPlan.midday.activity, locations[dayIndex])) }
          const evening = lockedSlots.evening && lockedDay ? lockedDay.evening : { ...dayPlan.evening, ...(await fetchImages(dayPlan.evening.activity, locations[dayIndex])) }

          return {
            day: dayIndex + 1,
            location: dayPlan.location,
            morning,
            midday,
            evening
          }
        })
      )

      setItineraries(itinerariesWithImages)

      const destinationData = convertToDestinations(locations.filter(loc => loc.trim()))
      const itineraryName = generateItineraryName(activity, locations.filter(loc => loc.trim()))
      const dayBreakdowns = convertToDayBreakdowns(itinerariesWithImages)

      if (savedItineraryId) {
        deleteItineraryFromHistory(savedItineraryId)
        const newId = saveItineraryToHistory(destinationData, tripDuration, dayBreakdowns, itineraryName)
        setSavedItineraryId(newId)
      } else {
        const itineraryId = saveItineraryToHistory(destinationData, tripDuration, dayBreakdowns, itineraryName)
        setSavedItineraryId(itineraryId)
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

    const currentDay = itineraries[selectedDayTab - 1]
    try {
      const response = await fetch("/api/quickstart-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity,
          location: currentDay.location,
          getAlternatives: true,
          targetSlot: slot,
          currentItinerary: {
            morning: currentDay.morning,
            midday: currentDay.midday,
            evening: currentDay.evening
          },
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
    if (detailView) {
      const updatedItineraries = itineraries.map((day, index) => {
        if (index === selectedDayTab - 1) {
          return {
            ...day,
            [detailView.slot]: alternative
          }
        }
        return day
      })

      setItineraries(updatedItineraries)

      if (savedItineraryId) {
        const dayBreakdowns = convertToDayBreakdowns(updatedItineraries)
        const destinationData = convertToDestinations(locations.filter(loc => loc.trim()))
        const itineraryName = generateItineraryName(activity, locations.filter(loc => loc.trim()))

        deleteItineraryFromHistory(savedItineraryId)
        const newId = saveItineraryToHistory(destinationData, tripDuration, dayBreakdowns, itineraryName)
        setSavedItineraryId(newId)
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

  const currentDayItinerary = itineraries[selectedDayTab - 1]
  const selectedDayForMap = itineraries.length > 0 && currentDayItinerary ? {
    day: selectedDayTab,
    location: currentDayItinerary.location,
    morning: {
      activity: currentDayItinerary.morning.title,
      description: currentDayItinerary.morning.description,
      imageUrl: currentDayItinerary.morning.imageUrl,
      imageUrls: currentDayItinerary.morning.imageUrls
    },
    midday: {
      activity: currentDayItinerary.midday.title,
      description: currentDayItinerary.midday.description,
      imageUrl: currentDayItinerary.midday.imageUrl,
      imageUrls: currentDayItinerary.midday.imageUrls
    },
    evening: {
      activity: currentDayItinerary.evening.title,
      description: currentDayItinerary.evening.description,
      imageUrl: currentDayItinerary.evening.imageUrl,
      imageUrls: currentDayItinerary.evening.imageUrls
    },
    coordinates: savedLocations[selectedDayTab - 1]?.coordinates,
    points_of_interest: []
  } as DayBreakdown : null

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pb-24 md:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 sm:mb-12 text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Multi-Day Trip Planner
                </span>
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left side - Form and Itinerary */}
              <div className="lg:col-span-2 space-y-6">
                {/* Planning Form */}
                <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden transition-all">
                  {itineraries.length > 0 && (
                    <button
                      onClick={() => setIsFormCollapsed(!isFormCollapsed)}
                      className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-foreground">
                          {activity && locations.filter(l => l).length > 0 ? `${activity} - ${tripDuration} day trip` : 'Trip Details'}
                        </span>
                      </div>
                      {isFormCollapsed ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  )}
                  <div className={`transition-all duration-300 ease-in-out ${isFormCollapsed && itineraries.length > 0 ? 'max-h-0 overflow-hidden' : 'max-h-[2000px]'}`}>
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
                        <label className="block text-sm font-semibold text-foreground">
                          Where are you going? <span className="text-secondary">*</span>
                        </label>

                        {locations.map((location, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <div className="relative flex-1">
                              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary pointer-events-none z-10" />
                              <input
                                type="text"
                                value={location}
                                onChange={(e) => updateLocation(index, e.target.value)}
                                onFocus={() => {
                                  setActiveLocationIndex(index)
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
                                placeholder={`Day ${index + 1} destination...`}
                                className="w-full pl-12 pr-4 py-3.5 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                                disabled={isGenerating || isLocating}
                              />
                              {showSuggestions && location.length >= 2 && activeLocationIndex === index && (
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
                                    citySuggestions.map((suggestion, idx) => (
                                      <button
                                        key={idx}
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
                            {index === 0 ? (
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
                                <span className="hidden sm:inline">Use Location</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => removeLocation(index)}
                                disabled={isGenerating}
                                className="px-4 py-3.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          onClick={addLocation}
                          disabled={isGenerating}
                          className="w-full py-3 border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-muted-foreground hover:text-primary font-medium"
                        >
                          <Plus className="w-5 h-5" />
                          Add Another Destination
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-foreground">
                          How many days? <span className="text-secondary">*</span>
                        </label>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setTripDuration(Math.max(1, tripDuration - 1))}
                            disabled={isGenerating || tripDuration <= 1}
                            className="w-12 h-12 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            −
                          </button>
                          <div className="flex-1 text-center">
                            <span className="text-3xl font-bold text-foreground">{tripDuration}</span>
                            <span className="text-lg text-muted-foreground ml-2">{tripDuration === 1 ? 'day' : 'days'}</span>
                          </div>
                          <button
                            onClick={() => setTripDuration(Math.min(14, tripDuration + 1))}
                            disabled={isGenerating || tripDuration >= 14}
                            className="w-12 h-12 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={generateItinerary}
                        disabled={isGenerating || !activity.trim() || locations.some(loc => !loc.trim())}
                        className="w-full py-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Generating Your Trip...
                          </>
                        ) : (
                          <>
                            <CalendarDays className="w-6 h-6" />
                            Plan My Trip
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Itinerary Display with Tabs */}
                {itineraries.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                          Your Trip Plan
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

                    {/* Day Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {itineraries.map((day) => (
                        <button
                          key={day.day}
                          onClick={() => setSelectedDayTab(day.day)}
                          className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${selectedDayTab === day.day
                            ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                          Day {day.day}
                        </button>
                      ))}
                    </div>

                    {/* Current Day Itinerary */}
                    {currentDayItinerary && (
                      <div className="space-y-6">
                        <div className="bg-card rounded-2xl border border-border shadow-lg p-6">
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            {currentDayItinerary.location}
                          </h3>
                          <p className="text-sm text-muted-foreground">Day {selectedDayTab} of your journey</p>
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
                                      {currentDayItinerary[slot].title}
                                    </h4>
                                    <div className={`text-xs sm:text-sm text-foreground/70 leading-relaxed transition-all ${expandedSlots[slot] ? '' : 'line-clamp-2'}`}>
                                      {currentDayItinerary[slot].description} {currentDayItinerary[slot].reason}
                                    </div>
                                    <button
                                      onClick={() => setExpandedSlots(prev => ({ ...prev, [slot]: !prev[slot] }))}
                                      className="text-xs font-semibold text-primary mt-1 hover:underline"
                                    >
                                      {expandedSlots[slot] ? 'Show less' : 'Read more'}
                                    </button>
                                  </div>

                                  {currentDayItinerary[slot].imageUrls && currentDayItinerary[slot].imageUrls!.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2 mt-3">
                                      {currentDayItinerary[slot].imageUrls!.slice(0, 4).map((imageUrl, idx) => (
                                        <button
                                          key={idx}
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedImage({ url: imageUrl, title: currentDayItinerary[slot].title })
                                          }}
                                          className="relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-all group"
                                        >
                                          <img
                                            src={imageUrl}
                                            alt={`${currentDayItinerary[slot].title} ${idx + 1}`}
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
                                    onClick={() => openDetailView(slot, currentDayItinerary[slot])}
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
                )}
              </div>

              {/* Right side - Map */}
              {itineraries.length > 0 && (
                <div className="lg:col-span-1">
                  <div className="sticky top-24 bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <h3 className="font-bold text-foreground flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Trip Map
                      </h3>
                    </div>
                    <div className="h-[400px] lg:h-[600px]">
                      <TripMap
                        locations={savedLocations}
                        selectedDay={selectedDayForMap}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detail View Modal */}
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

        {/* Inspiration Modal */}
        <InspirationModal
          isOpen={showInspirationModal}
          onClose={() => setShowInspirationModal(false)}
          activity={activity}
          location={currentDayItinerary?.location || locations.filter(l => l)[0] || ""}
          onRegenerateWithPreferences={regenerateWithPreferences}
        />

        {/* Image Viewer */}
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

export default function Plan() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <PlanContent />
    </Suspense>
  )
}
