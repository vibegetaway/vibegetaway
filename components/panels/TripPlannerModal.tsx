'use client'

import { useState, useEffect } from 'react'
import { Destination } from '@/lib/generateDestinationInfo'
import { X, MapPin, Plane, Calendar, DollarSign, Clock, ArrowRight, Loader2 } from 'lucide-react'
import { getCountryName } from '@/lib/countryCodeMapping'
import { type ItineraryItem } from '@/lib/itinerary'

interface TripPlannerModalProps {
  isOpen: boolean
  onClose: () => void
  itineraryItems: ItineraryItem[]
}

export function TripPlannerModal({ isOpen, onClose, itineraryItems }: TripPlannerModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  // Helper to parse pricing values
  function parsePricing(value: string | number): number {
    if (typeof value === 'number') return value
    const strValue = String(value)
    const match = strValue.match(/(\d+)/)
    return match ? parseInt(match[1], 10) : 0
  }

  // Calculate total costs
  const totalDailyCost = itineraryItems.reduce((sum, item) => {
    const dest = item.destination
    if (!dest.pricing) return sum
    
    const accommodationPrice = parsePricing(dest.pricing.accommodation || 0)
    const foodPrice = parsePricing(dest.pricing.food || 0)
    const activitiesPrice = parsePricing(dest.pricing.activities || 0)
    
    return sum + accommodationPrice + foodPrice + activitiesPrice
  }, 0)

  // Estimate 3 days per destination
  const estimatedDays = itineraryItems.length * 3
  const totalEstimatedCost = totalDailyCost * estimatedDays

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-amber-200/50 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-2">Your Multi-City Trip</h2>
              <p className="text-stone-600">
                {itineraryItems.length} destinations • Est. {estimatedDays} days
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-stone-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Cost Summary */}
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-amber-200/50 rounded-xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-stone-600 mb-1">Daily Cost per Person</p>
                <p className="text-2xl font-bold text-orange-600">${totalDailyCost}</p>
              </div>
              <div>
                <p className="text-sm text-stone-600 mb-1">Estimated Total ({estimatedDays} days)</p>
                <p className="text-2xl font-bold text-orange-600">${totalEstimatedCost}</p>
              </div>
            </div>
            <p className="text-xs text-stone-500 mt-3">
              * Costs are estimates and don't include flights. Add ~3 days per destination.
            </p>
          </div>

          {/* Trip Route */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" />
              Your Route
            </h3>
            
            <div className="space-y-4">
              {itineraryItems.map((item, index) => {
                const destination = item.destination
                
                // Calculate daily cost
                let dailyCost = 0
                if (destination.pricing) {
                  const accommodationPrice = parsePricing(destination.pricing.accommodation || 0)
                  const foodPrice = parsePricing(destination.pricing.food || 0)
                  const activitiesPrice = parsePricing(destination.pricing.activities || 0)
                  dailyCost = accommodationPrice + foodPrice + activitiesPrice
                }

                return (
                  <div key={item.id}>
                    {/* Destination Card */}
                    <div className="bg-white border border-amber-200/50 rounded-lg p-4 hover:border-amber-300 transition-colors">
                      <div className="flex items-start gap-3">
                        {/* Step Number */}
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>

                        {/* Destination Info */}
                        <div className="flex-1">
                          <h4 className="font-bold text-stone-900 text-lg mb-1">
                            {destination.region}
                          </h4>
                          <p className="text-sm text-stone-600 mb-2">
                            {getCountryName(destination.country)}
                          </p>

                          {/* Description */}
                          {destination.description?.[0] && (
                            <p className="text-sm text-stone-700 mb-3 line-clamp-2">
                              {destination.description[0]}
                            </p>
                          )}

                          {/* Stats */}
                          <div className="flex flex-wrap gap-3 text-sm">
                            <div className="flex items-center gap-1.5 text-stone-600">
                              <Calendar className="w-4 h-4" />
                              <span>~3 days</span>
                            </div>
                            {dailyCost > 0 && (
                              <div className="flex items-center gap-1.5 text-orange-600 font-semibold">
                                <DollarSign className="w-4 h-4" />
                                <span>${dailyCost}/day</span>
                              </div>
                            )}
                            {destination.recommendedDuration && (
                              <div className="flex items-center gap-1.5 text-stone-600">
                                <Clock className="w-4 h-4" />
                                <span>{destination.recommendedDuration}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Arrow between destinations */}
                    {index < itineraryItems.length - 1 && (
                      <div className="flex items-center justify-center py-2">
                        <div className="flex items-center gap-2 text-stone-400">
                          <ArrowRight className="w-5 h-5" />
                          <span className="text-sm">Travel to next destination</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-amber-50 border border-amber-200/50 rounded-lg p-4">
            <h4 className="font-semibold text-stone-900 mb-2">Travel Tips</h4>
            <ul className="space-y-1.5 text-sm text-stone-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>Book flights between destinations in advance for better prices</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>Consider travel time between cities when planning your schedule</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>Check visa requirements for each country on your route</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>Pack light to make moving between cities easier</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-amber-200/50 bg-stone-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-stone-300 text-stone-700 font-medium rounded-lg hover:bg-stone-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                // Future: Export or share itinerary
                alert('Export feature coming soon!')
              }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-amber-600 transition-colors shadow-lg"
            >
              Export Trip Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

