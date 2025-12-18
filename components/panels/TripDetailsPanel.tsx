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
                                        <div key={idx} className="bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-violet-100 shadow-sm hover:shadow-md transition-all group">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-bold text-violet-900 text-sm leading-snug">{poi.name}</h4>
                                                {poi.tags && (
                                                    <div className="flex gap-1 flex-wrap justify-end max-w-[50%]">
                                                        {poi.tags.map((tag, tIdx) => (
                                                            <span key={tIdx} className="text-[10px] font-medium px-2 py-0.5 bg-violet-100/50 border border-violet-200 text-violet-700 rounded-full capitalize whitespace-nowrap">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Body - Insight */}
                                            {poi.insight && (
                                                <div className="mb-4">
                                                    <p className="text-sm text-violet-700/90 leading-relaxed font-normal">
                                                        {poi.insight}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Footer - Metadata */}
                                            <div className="flex items-center gap-4 text-xs text-violet-500 font-medium pt-3 border-t border-violet-100/50">
                                                {poi.cost && (
                                                    <div className="flex items-center gap-1.5" title="Estimated Cost">
                                                        <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2.5V5z" /><path d="M3 10v4" /><path d="M21 5v9" /></svg>
                                                        </div>
                                                        <span>{poi.cost}</span>
                                                    </div>
                                                )}
                                                {poi.duration && (
                                                    <div className="flex items-center gap-1.5" title="Suggested Duration">
                                                        <div className="p-1 rounded-md bg-blue-50 text-blue-600">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                        </div>
                                                        <span>{poi.duration}</span>
                                                    </div>
                                                )}
                                            </div>
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
