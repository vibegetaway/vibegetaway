'use client'

import { X, Trash2, Clock, MapPin, Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getSearchHistory,
  deleteSearchFromHistory,
  clearSearchHistory,
  formatSearchText,
  formatTimestamp,
  type SearchHistoryItem
} from '@/lib/searchHistory'
import {
  getItineraryHistory,
  deleteItineraryFromHistory,
  formatTimeAgo,
  type SavedItinerary
} from '@/lib/itineraryHistory'

interface RecentSearchPanelProps {
  isOpen: boolean
  onClose: () => void
  onSearchSelect: (item: SearchHistoryItem) => void
}

type TabType = 'searches' | 'itineraries'

export function RecentSearchPanel({ isOpen, onClose, onSearchSelect }: RecentSearchPanelProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('searches')
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [itineraryHistory, setItineraryHistory] = useState<SavedItinerary[]>([])

  useEffect(() => {
    if (isOpen) {
      // Load both histories when panel opens
      setSearchHistory(getSearchHistory())
      setItineraryHistory(getItineraryHistory())
    }
  }, [isOpen])

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the search selection
    deleteSearchFromHistory(id)
    setSearchHistory(getSearchHistory())
  }

  const handleClearAllSearches = () => {
    if (confirm('Are you sure you want to clear all search history?')) {
      clearSearchHistory()
      setSearchHistory([])
    }
  }

  const handleClearAllItineraries = () => {
    if (confirm('Are you sure you want to clear all itinerary history?')) {
      localStorage.removeItem('vibegetaway-itinerary-history')
      setItineraryHistory([])
    }
  }

  const handleSearchClick = (item: SearchHistoryItem) => {
    onSearchSelect(item)
    onClose()
  }

  const handleItineraryClick = (itinerary: SavedItinerary) => {
    // Navigate directly to the itinerary page with its ID
    router.push(`/plan/${itinerary.id}`)
    onClose()
  }

  const handleDeleteItinerary = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteItineraryFromHistory(id)
    setItineraryHistory(getItineraryHistory())
  }

  return (
    <>
      {/* Panel - positioned next to LeftSidebar (left-16), same width as DestinationInfoPanel */}
      <div
        className={`fixed left-0 md:left-16 top-0 h-screen w-[28rem] bg-violet-50 border-r border-violet-200/50 shadow-2xl z-50 transition-transform duration-300 ease-in-out overflow-y-auto pointer-events-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Spacer for text input */}


        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-violet-900 mb-1 tracking-tight">History</h2>
              <p className="text-violet-500 text-xs font-medium">Your searches and itineraries</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-violet-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-violet-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 p-1 bg-violet-100 rounded-lg">
            <button
              onClick={() => setActiveTab('searches')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-semibold text-sm transition-all ${activeTab === 'searches'
                  ? 'bg-white text-violet-900 shadow-sm'
                  : 'text-violet-600 hover:text-violet-900'
                }`}
            >
              <Clock className="w-4 h-4" />
              Searches
            </button>
            <button
              onClick={() => setActiveTab('itineraries')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-semibold text-sm transition-all ${activeTab === 'itineraries'
                  ? 'bg-white text-violet-900 shadow-sm'
                  : 'text-violet-600 hover:text-violet-900'
                }`}
            >
              <MapPin className="w-4 h-4" />
              Itineraries
            </button>
          </div>

          {/* Clear All Button */}
          {activeTab === 'searches' && searchHistory.length > 0 && (
            <button
              onClick={handleClearAllSearches}
              className="mb-6 w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Searches
            </button>
          )}
          {activeTab === 'itineraries' && itineraryHistory.length > 0 && (
            <button
              onClick={handleClearAllItineraries}
              className="mb-6 w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Itineraries
            </button>
          )}

          {/* Content based on active tab */}
          {activeTab === 'searches' ? (
            // Search History List
            searchHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Clock className="w-16 h-16 text-pink-300 mb-4" />
                <p className="text-violet-900 font-bold text-lg mb-1">No recent searches</p>
                <p className="text-violet-500 text-sm">Your search history will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchHistory.map((item) => (
                  <div
                    key={item.id}
                    className="relative group w-full bg-white rounded-xl transition-all duration-300 shadow-sm border-2 hover:shadow-lg hover:shadow-violet-200/50 border-violet-200/60 hover:border-violet-300"
                  >
                    <button
                      onClick={() => handleSearchClick(item)}
                      className="w-full p-4 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          {/* Search Text */}
                          <p className="text-violet-900 font-bold text-lg leading-tight mb-1">
                            {formatSearchText(item.vibe, item.timePeriod)}
                          </p>

                          {/* Timestamp and Destination Count */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-violet-500 mt-1">
                            <span className="flex items-center gap-1 mr-1">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(item.timestamp)}
                            </span>

                            {item.destinations && item.destinations.length > 0 && (
                              <span className="px-1.5 py-0.5 bg-pink-50 text-pink-600 rounded border border-pink-100 font-medium">
                                {item.destinations.length} results
                              </span>
                            )}

                            {/* Filter Tags */}
                            {item.filters?.origin && (
                              <span className="px-1.5 py-0.5 bg-violet-100 text-violet-600 rounded border border-violet-200">
                                from: {item.filters.origin}
                              </span>
                            )}
                            {item.filters?.destinations && item.filters.destinations.length > 0 && (
                              <span className="px-1.5 py-0.5 bg-violet-100 text-violet-600 rounded border border-violet-200">
                                in: {item.filters.destinations.join(', ')}
                              </span>
                            )}
                            {item.filters?.duration && (
                              <span className="px-1.5 py-0.5 bg-violet-100 text-violet-600 rounded border border-violet-200">
                                {item.filters.duration[0]}-{item.filters.duration[1]} days
                              </span>
                            )}
                            {item.filters?.budget && item.filters.budget < 2000 && (
                              <span className="px-1.5 py-0.5 bg-violet-100 text-violet-600 rounded border border-violet-200">
                                &lt;${item.filters.budget}
                              </span>
                            )}
                            {item.filters?.exclusions && item.filters.exclusions.length > 0 && (
                              <span className="px-1.5 py-0.5 bg-violet-100 text-violet-600 rounded border border-violet-200">
                                no {item.filters.exclusions.join(', ')}
                              </span>
                            )}
                            {item.filters?.styles && item.filters.styles.length > 0 && (
                              <span className="px-1.5 py-0.5 bg-violet-100 text-violet-600 rounded border border-violet-200">
                                {item.filters.styles.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="absolute top-3 right-3 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-rose-50 text-violet-400 hover:text-rose-500 transition-all"
                      aria-label="Delete search"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Itinerary History List
            itineraryHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Calendar className="w-16 h-16 text-pink-300 mb-4" />
                <p className="text-violet-900 font-bold text-lg mb-1">No saved itineraries</p>
                <p className="text-violet-500 text-sm">Generated itineraries will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {itineraryHistory.map((itinerary) => (
                  <div
                    key={itinerary.id}
                    className="relative group w-full bg-white rounded-xl transition-all duration-300 shadow-sm border-2 hover:shadow-lg hover:shadow-violet-200/50 border-violet-200/60 hover:border-violet-300"
                  >
                    <button
                      onClick={() => handleItineraryClick(itinerary)}
                      className="w-full p-4 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          {/* Itinerary Name */}
                          <p className="text-violet-900 font-bold text-lg leading-tight mb-2">
                            {itinerary.name || 'Untitled Trip'}
                          </p>

                          {/* Locations */}
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {itinerary.locations.map((loc, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-full text-xs font-medium"
                              >
                                {loc.region || loc.country}
                              </span>
                            ))}
                          </div>

                          {/* Duration and timestamp */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-violet-500 mt-1">
                            <span className="flex items-center gap-1 mr-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(itinerary.timestamp)}
                            </span>
                            <span className="px-1.5 py-0.5 bg-pink-50 text-pink-600 rounded border border-pink-100 font-medium">
                              {itinerary.tripDuration} days
                            </span>
                            <span className="px-1.5 py-0.5 bg-violet-100 text-violet-600 rounded border border-violet-200">
                              {itinerary.generatedPlan.length} day plan
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDeleteItinerary(itinerary.id, e)}
                      className="absolute top-3 right-3 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-rose-50 text-violet-400 hover:text-rose-500 transition-all"
                      aria-label="Delete itinerary"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </>
  )
}

