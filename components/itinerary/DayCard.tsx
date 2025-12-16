'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Sun, CloudSun, Moon, Plane } from 'lucide-react'
import type { GeneratedDay } from '@/lib/itinerary'

interface DayCardProps {
  day: GeneratedDay
  locationColor?: string
  defaultExpanded?: boolean
}

export function DayCard({ day, locationColor = 'bg-violet-100 text-violet-800', defaultExpanded = false }: DayCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const isTravel = day.location.toLowerCase().includes('travel') || 
                   day.morning.activity.toLowerCase().includes('travel') ||
                   day.morning.activity.toLowerCase().includes('flight') ||
                   day.morning.activity.toLowerCase().includes('arrive')

  return (
    <div className="bg-white border border-violet-200/60 rounded-xl overflow-hidden transition-all duration-300 hover:border-violet-300 hover:shadow-md">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-violet-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
            {day.dayNumber}
          </div>
          <div>
            <h4 className="font-semibold text-violet-900">Day {day.dayNumber}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${locationColor}`}>
                {day.location}
              </span>
              {isTravel && (
                <Plane className="w-3 h-3 text-violet-400" />
              )}
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-violet-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-violet-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          <TimeSlot
            icon={<Sun className="w-4 h-4 text-amber-500" />}
            label="Morning"
            activity={day.morning.activity}
            description={day.morning.description}
          />
          <TimeSlot
            icon={<CloudSun className="w-4 h-4 text-orange-400" />}
            label="Midday"
            activity={day.midday.activity}
            description={day.midday.description}
          />
          <TimeSlot
            icon={<Moon className="w-4 h-4 text-indigo-400" />}
            label="Evening"
            activity={day.evening.activity}
            description={day.evening.description}
          />
        </div>
      )}
    </div>
  )
}

function TimeSlot({
  icon,
  label,
  activity,
  description,
}: {
  icon: React.ReactNode
  label: string
  activity: string
  description: string
}) {
  return (
    <div className="flex gap-3 p-3 bg-violet-50/50 rounded-lg">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-violet-500 uppercase tracking-wide">{label}</span>
        </div>
        <p className="font-medium text-violet-900 mt-0.5">{activity}</p>
        {description && (
          <p className="text-sm text-violet-600 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  )
}
