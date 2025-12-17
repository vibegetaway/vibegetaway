'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ChevronDown, ChevronUp, ArrowLeft, Sun, Cloud, Moon, MapPin, Sparkles } from 'lucide-react'
import { getItineraryById, type DayBreakdown } from '@/lib/itineraryHistory'
import type { Destination } from '@/lib/generateDestinationInfo'

export default function ViewItineraryPage() {
  const router = useRouter()
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : ''

  const [itineraryName, setItineraryName] = useState('')
  const [savedLocations, setSavedLocations] = useState<Destination[]>([])
  const [tripDuration, setTripDuration] = useState(0)
  const [generatedPlan, setGeneratedPlan] = useState<DayBreakdown[]>([])
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]))
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) {
      setNotFound(true)
      return
    }

    const itinerary = getItineraryById(id)

    if (!itinerary) {
      setNotFound(true)
      return
    }

    setItineraryName(itinerary.name)
    setSavedLocations(itinerary.locations)
    setTripDuration(itinerary.tripDuration)
    setGeneratedPlan(itinerary.generatedPlan)
  }, [id])

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

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-100 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-violet-900 mb-4">Itinerary Not Found</h1>
          <p className="text-violet-600 mb-6">This itinerary doesn't exist or may have been deleted.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-pink-500 text-white font-semibold rounded-lg hover:from-violet-600 hover:to-pink-600 transition-all"
          >
            Go Back Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-violet-100 via-pink-100 to-rose-100">
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
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
              {itineraryName}
            </h1>
            <p className="text-sm text-violet-500 mt-1">Trip ID: {id}</p>
          </div>
          <div className="w-32" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Itinerary */}
          <div className="space-y-6">
            {/* Trip Summary */}
            <div className="relative bg-gradient-to-br from-white to-violet-50/30 rounded-2xl shadow-xl p-8 border border-violet-200/50 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400/10 to-violet-400/10 rounded-full blur-3xl"></div>

              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-violet-900">Trip Summary</h2>
                </div>

                <div className="mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-violet-100">
                  <p className="text-sm text-violet-700 font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Destinations
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {savedLocations.map((loc, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-full text-sm font-medium shadow-md"
                      >
                        {loc.region || loc.country}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-violet-100">
                  <p className="text-sm text-violet-700 font-semibold">Duration</p>
                  <p className="text-2xl font-bold text-violet-900 mt-1">{tripDuration} days</p>
                </div>
              </div>
            </div>

            {/* Generated Itinerary */}
            {generatedPlan.length > 0 && (
              <div className="relative bg-gradient-to-br from-white to-pink-50/30 rounded-2xl shadow-xl p-8 border border-pink-200/50 backdrop-blur-sm">
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
                            className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
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

          {/* Right Side - Placeholder */}
          <div className="space-y-6">
            <div className="relative bg-gradient-to-br from-white/60 to-violet-50/30 backdrop-blur-sm rounded-2xl border-2 border-dashed border-violet-300/50 p-16 text-center shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-200/10 to-pink-200/10 rounded-2xl"></div>
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-200 to-pink-200 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-violet-600" />
                </div>
                <p className="text-violet-500 font-semibold text-lg">Share Your Trip</p>
                <p className="text-violet-400 text-sm mt-2">Sharing features coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
