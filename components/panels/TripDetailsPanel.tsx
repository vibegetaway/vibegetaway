import { useState } from 'react'
import { Sparkles, Calendar, AlertTriangle, MapPin, Info } from 'lucide-react'
import type { DayBreakdown } from '@/lib/itineraryHistory'
import { cn } from '@/lib/utils'

interface TripDetailsPanelProps {
    selectedDayData: DayBreakdown | null
    className?: string
}

export function TripDetailsPanel({ selectedDayData, className }: TripDetailsPanelProps) {
    const [activeTab, setActiveTab] = useState<'general' | 'events' | 'alerts'>('general')

    if (!selectedDayData) {
        return (
            <div className={cn("flex-1 bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg relative flex items-center justify-center flex-col gap-3 group p-8", className)}>
                <div className="p-4 bg-pink-100 rounded-full text-pink-500 group-hover:scale-110 transition-transform shadow-inner">
                    <Info className="w-8 h-8" />
                </div>
                <p className="font-bold text-pink-500">Select a day to view details</p>
                <p className="text-sm text-pink-400 text-center">Click on a day in your itinerary to see specific events, alerts, and recommendations.</p>
            </div>
        )
    }

    return (
        <div className={cn("flex-1 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden flex flex-col", className)}>
            {/* Header */}
            <div className="p-3 pb-2 border-b border-violet-100 bg-gradient-to-r from-violet-50/50 to-pink-50/50">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-violet-900 flex items-center gap-2">
                            Day {selectedDayData.day}
                            <span className="text-sm font-normal text-violet-500 bg-violet-100 px-2 py-0.5 rounded-full">
                                {selectedDayData.location}
                            </span>
                        </h2>
                        {selectedDayData.why_its_nice && (
                            <p className="text-sm text-violet-600 mt-1 italic">"{selectedDayData.why_its_nice}"</p>
                        )}
                    </div>
                    {selectedDayData.best_time_to_visit && (
                        <div className="text-xs font-medium text-violet-500 bg-white/50 px-3 py-1 rounded-lg border border-violet-100">
                            Best time: {selectedDayData.best_time_to_visit}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                {/* ... tabs code ... */}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all",
                            activeTab === 'general'
                                ? "bg-violet-500 text-white shadow-md"
                                : "bg-white/50 text-violet-500 hover:bg-white hover:text-violet-700"
                        )}
                    >
                        <Info className="w-4 h-4" />
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('events')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all",
                            activeTab === 'events'
                                ? "bg-pink-500 text-white shadow-md"
                                : "bg-white/50 text-pink-500 hover:bg-white hover:text-pink-700"
                        )}
                    >
                        <Sparkles className="w-4 h-4" />
                        Events
                        {selectedDayData.events && selectedDayData.events.length > 0 && (
                            <span className="bg-white/20 text-white text-[10px] px-1.5 rounded-full ml-1">
                                {selectedDayData.events.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('alerts')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all",
                            activeTab === 'alerts'
                                ? "bg-amber-500 text-white shadow-md"
                                : "bg-white/50 text-amber-600 hover:bg-white hover:text-amber-700"
                        )}
                    >
                        <AlertTriangle className="w-4 h-4" />
                        Alerts
                        {selectedDayData.alerts && selectedDayData.alerts.length > 0 && (
                            <span className="bg-white/20 text-white text-[10px] px-1.5 rounded-full ml-1">
                                {selectedDayData.alerts.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-violet-200 scrollbar-track-transparent">
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        {/* Recommended Places */}
                        {selectedDayData.points_of_interest && selectedDayData.points_of_interest.length > 0 && (
                            <div className="mt-6">
                                <h3 className="font-bold text-violet-900 mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-violet-500" />
                                    Recommended Spots
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {selectedDayData.points_of_interest.map((poi, idx) => (
                                        <div key={idx} className="bg-violet-50/50 p-4 rounded-xl border border-violet-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-violet-900 text-sm">{poi.name}</h4>
                                                {poi.tags && (
                                                    <div className="flex gap-1 flex-wrap justify-end max-w-[50%]">
                                                        {poi.tags.map((tag, tIdx) => (
                                                            <span key={tIdx} className="text-[10px] font-medium px-2 py-0.5 bg-white border border-violet-200 text-violet-600 rounded-full capitalize">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {poi.insight && (
                                                <div className="mb-2 p-2 bg-white/60 rounded-lg border border-violet-100/50">
                                                    <p className="text-xs text-violet-700 italic border-l-2 border-pink-400 pl-2">
                                                        "{poi.insight}"
                                                    </p>
                                                </div>
                                            )}

                                            <p className="text-xs text-violet-500 mt-1">{poi.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'events' && (
                    <div className="space-y-4">
                        {!selectedDayData.events || selectedDayData.events.length === 0 ? (
                            <div className="text-center py-10 text-violet-400">
                                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No special events listed for this day.</p>
                            </div>
                        ) : (
                            selectedDayData.events.map((event, idx) => (
                                <div key={idx} className="bg-gradient-to-br from-pink-50 to-white p-4 rounded-xl border border-pink-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-pink-200/20 to-transparent rounded-bl-full"></div>
                                    <h4 className="font-bold text-pink-700 mb-1">{event.name}</h4>
                                    <p className="text-sm text-pink-600/80">{event.description}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'alerts' && (
                    <div className="space-y-4">
                        {!selectedDayData.alerts || selectedDayData.alerts.length === 0 ? (
                            <div className="text-center py-10 text-violet-400">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                                <p>No alerts for this location.</p>
                                <p className="text-sm">Enjoy your worry-free travel!</p>
                            </div>
                        ) : (
                            selectedDayData.alerts.map((alert, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "p-4 rounded-xl border-l-4 shadow-sm",
                                        alert.type === 'warning'
                                            ? "bg-amber-50 border-amber-500 text-amber-900"
                                            : "bg-blue-50 border-blue-500 text-blue-900"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className={cn("w-5 h-5 flex-shrink-0", alert.type === 'warning' ? "text-amber-500" : "text-blue-500")} />
                                        <div>
                                            <p className="text-sm font-medium leading-relaxed">{alert.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
