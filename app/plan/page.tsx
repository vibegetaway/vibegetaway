'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Loader2, Sparkles, ArrowLeft, Sun, Cloud, Moon, MapPin } from 'lucide-react'
import { getSavedLocations } from '@/lib/itinerary'
import type { Destination } from '@/lib/generateDestinationInfo'
import { saveItineraryToHistory, type DayBreakdown } from '@/lib/itineraryHistory'

export default function PlanPage() {
  const router = useRouter()
  const [savedLocations, setSavedLocations] = useState<Destination[]>([])
  const [tripDuration, setTripDuration] = useState(7)
  const [generatedPlan, setGeneratedPlan] = useState<DayBreakdown[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]))

  useEffect(() => {
    // Load from saved locations
    const locations = getSavedLocations()
    if (locations.length === 0) {
      router.push('/')
      return
    }
    setSavedLocations(locations)

    const suggestedDuration = locations.reduce((total, loc) => {
      const recommended = parseInt(loc.recommendedDuration || '3', 10)
      return total + (isNaN(recommended) ? 3 : recommended)
    }, 0)
    setTripDuration(Math.max(7, Math.min(suggestedDuration, 30)))
  }, [router])

  const handlePlanTrip = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locations: savedLocations.map(loc => ({
            region: loc.region,
            country: loc.country,
            recommendedDuration: loc.recommendedDuration,
          })),
          tripDuration,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate itinerary')
      }

      const data = await response.json()
      setGeneratedPlan(data.plan)
      setExpandedDays(new Set([1]))
      
      // Generate name for the itinerary
      try {
        const nameResponse = await fetch('/api/generate-itinerary-name', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            locations: savedLocations,
            tripDuration,
          }),
        })

        let itineraryId = ''
        if (nameResponse.ok) {
          const { name } = await nameResponse.json()
          itineraryId = saveItineraryToHistory(savedLocations, tripDuration, data.plan, name)
        } else {
          // Fallback to auto-generated name
          const fallbackName = `${savedLocations.map(l => l.region || l.country).join(' & ')} Trip`
          itineraryId = saveItineraryToHistory(savedLocations, tripDuration, data.plan, fallbackName)
        }
        
        // Navigate to the itinerary page with the ID
        if (itineraryId) {
          router.push(`/plan/${itineraryId}`)
        }
      } catch (nameError) {
        console.error('Error generating itinerary name:', nameError)
        // Fallback to auto-generated name
        const fallbackName = `${savedLocations.map(l => l.region || l.country).join(' & ')} Trip`
        const itineraryId = saveItineraryToHistory(savedLocations, tripDuration, data.plan, fallbackName)
        
        // Navigate to the itinerary page with the ID
        if (itineraryId) {
          router.push(`/plan/${itineraryId}`)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleDay = (day: number) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev)
      if (newSet.has(day)) {
        newSet.delete(day)
      } else {
        newSet.add(day)
      }
      return newSet
    })
  }

  const expandAll = () => {
    setExpandedDays(new Set(generatedPlan.map(d => d.day)))
  }

  const collapseAll = () => {
    setExpandedDays(new Set())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-100 to-rose-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-violet-200/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 hover:text-violet-900 transition-all font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Map</span>
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">Itinerary Planner</h1>
          <div className="w-32" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Itinerary */}
          <div className="space-y-6">
            {/* Planning Controls */}
            <div className="relative bg-gradient-to-br from-white to-violet-50/30 rounded-2xl shadow-xl p-8 border border-violet-200/50 backdrop-blur-sm">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400/10 to-violet-400/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-violet-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-violet-900">Plan Your Trip</h2>
                </div>
                
                {/* Saved Locations Summary */}
                <div className="mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-violet-100">
                  <p className="text-sm text-violet-700 font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Your Destinations
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {savedLocations.map((loc, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                      >
                        {loc.region || loc.country}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Trip Duration Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-violet-900 mb-3">
                    Trip Duration
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={tripDuration}
                      onChange={(e) => setTripDuration(parseInt(e.target.value, 10) || 7)}
                      className="w-full px-5 py-4 bg-white/80 border-2 border-violet-200 rounded-xl focus:ring-4 focus:ring-violet-200 focus:border-violet-400 transition-all text-lg font-semibold text-violet-900 shadow-sm"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-violet-400 font-medium">
                      days
                    </span>
                  </div>
                </div>

                {/* Plan Button */}
                <button
                  onClick={handlePlanTrip}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-bold rounded-xl hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Generating Your Itinerary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      Plan My Trip
                    </>
                  )}
                </button>

                {error && (
                  <div className="mt-4 p-4 bg-rose-50/80 backdrop-blur-sm border-2 border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Generated Itinerary */}
            {generatedPlan.length > 0 && (
              <div className="relative bg-gradient-to-br from-white to-pink-50/30 rounded-2xl shadow-xl p-8 border border-pink-200/50 backdrop-blur-sm">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-violet-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-violet-500 to-pink-500 rounded-lg">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-violet-900">Your Itinerary</h2>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={expandAll}
                        className="text-xs font-semibold text-violet-600 hover:text-white px-4 py-2 hover:bg-violet-500 bg-violet-100 rounded-lg transition-all"
                      >
                        Expand All
                      </button>
                      <button
                        onClick={collapseAll}
                        className="text-xs font-semibold text-violet-600 hover:text-white px-4 py-2 hover:bg-violet-500 bg-violet-100 rounded-lg transition-all"
                      >
                        Collapse All
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {generatedPlan.map((day) => {
                      const isExpanded = expandedDays.has(day.day)
                      
                      return (
                        <div
                          key={day.day}
                          className="bg-white/80 backdrop-blur-sm border-2 border-violet-200/50 rounded-2xl overflow-hidden transition-all shadow-md hover:shadow-lg"
                        >
                          {/* Day Header */}
                          <button
                            onClick={() => toggleDay(day.day)}
                            className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-violet-100/80 to-pink-100/80 hover:from-violet-200/80 hover:to-pink-200/80 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <span className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-violet-500 to-pink-500 text-white font-bold rounded-xl text-base shadow-lg">
                                {day.day}
                              </span>
                              <div className="text-left">
                                <p className="font-bold text-violet-900 text-lg">Day {day.day}</p>
                                <p className="text-sm text-violet-600 font-medium">{day.location}</p>
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-6 h-6 text-violet-600" />
                            ) : (
                              <ChevronDown className="w-6 h-6 text-violet-600" />
                            )}
                          </button>

                          {/* Day Content */}
                          <div
                            className={`transition-all duration-300 ease-in-out ${
                              isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                            } overflow-hidden`}
                          >
                            <div className="p-6 space-y-5 bg-gradient-to-br from-white to-violet-50/30">
                              {/* Morning */}
                              <div className="flex gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-amber-200/50 hover:border-amber-300 transition-all">
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
                                    <Sun className="w-6 h-6 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-violet-900 mb-2 text-base">
                                    Morning: {day.morning.activity}
                                  </h4>
                                  <p className="text-sm text-violet-700 leading-relaxed">{day.morning.description}</p>
                                </div>
                              </div>

                              {/* Midday */}
                              <div className="flex gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-sky-200/50 hover:border-sky-300 transition-all">
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-400 rounded-xl flex items-center justify-center shadow-lg">
                                    <Cloud className="w-6 h-6 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-violet-900 mb-2 text-base">
                                    Midday: {day.midday.activity}
                                  </h4>
                                  <p className="text-sm text-violet-700 leading-relaxed">{day.midday.description}</p>
                                </div>
                              </div>

                              {/* Evening */}
                              <div className="flex gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-indigo-200/50 hover:border-indigo-300 transition-all">
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <Moon className="w-6 h-6 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-violet-900 mb-2 text-base">
                                    Evening: {day.evening.activity}
                                  </h4>
                                  <p className="text-sm text-violet-700 leading-relaxed">{day.evening.description}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Placeholder for future options */}
          <div className="space-y-6">
            <div className="relative bg-gradient-to-br from-white/60 to-violet-50/30 backdrop-blur-sm rounded-2xl border-2 border-dashed border-violet-300/50 p-16 text-center shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-200/10 to-pink-200/10 rounded-2xl"></div>
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-200 to-pink-200 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-violet-600" />
                </div>
                <p className="text-violet-500 font-semibold text-lg">More Features Coming Soon</p>
                <p className="text-violet-400 text-sm mt-2">Additional customization options</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
