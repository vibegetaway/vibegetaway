'use client'

import { X, Trash2, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  getSearchHistory,
  deleteSearchFromHistory,
  clearSearchHistory,
  formatSearchText,
  formatTimestamp,
  type SearchHistoryItem
} from '@/lib/searchHistory'

interface RecentSearchPanelProps {
  isOpen: boolean
  onClose: () => void
  onSearchSelect: (item: SearchHistoryItem) => void
}

export function RecentSearchPanel({ isOpen, onClose, onSearchSelect }: RecentSearchPanelProps) {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])

  useEffect(() => {
    if (isOpen) {
      // Load history when panel opens
      setSearchHistory(getSearchHistory())
    }
  }, [isOpen])

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the search selection
    deleteSearchFromHistory(id)
    setSearchHistory(getSearchHistory())
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all search history?')) {
      clearSearchHistory()
      setSearchHistory([])
    }
  }

  const handleSearchClick = (item: SearchHistoryItem) => {
    onSearchSelect(item)
    onClose()
  }

  return (
    <>
      {/* Panel - positioned next to LeftSidebar (left-20), same width as SidePanel */}
      <div
        className={`fixed left-20 top-0 h-screen w-full max-w-md bg-stone-50 border-r border-amber-200/50 shadow-2xl z-50 transition-transform duration-300 ease-in-out overflow-y-auto pointer-events-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Spacer for text input */}


        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 mb-1 tracking-tight">Recent Searches</h2>
              <p className="text-stone-500 text-xs font-medium">Your search history</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>

          {/* Clear All Button */}
          {searchHistory.length > 0 && (
            <button
              onClick={handleClearAll}
              className="mb-6 w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Clear All History
            </button>
          )}

          {/* Search History List */}
          {searchHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Clock className="w-16 h-16 text-amber-300 mb-4" />
              <p className="text-stone-900 font-bold text-lg mb-1">No recent searches</p>
              <p className="text-stone-500 text-sm">Your search history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchHistory.map((item) => (
                <div
                  key={item.id}
                  className="relative group w-full bg-white rounded-xl transition-all duration-300 shadow-sm border-2 hover:shadow-lg hover:shadow-stone-200/50 border-stone-200/60 hover:border-stone-300"
                >
                  <button
                    onClick={() => handleSearchClick(item)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {/* Search Text */}
                        <p className="text-stone-900 font-bold text-lg leading-tight mb-1">
                          {formatSearchText(item.vibe, item.timePeriod)}
                        </p>

                        {/* Timestamp and Destination Count */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mt-1">
                          <span className="flex items-center gap-1 mr-1">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(item.timestamp)}
                          </span>

                          {item.destinations && item.destinations.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-100 font-medium">
                              {item.destinations.length} results
                            </span>
                          )}

                          {/* Filter Tags */}
                          {item.filters?.origin && (
                            <span className="px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded border border-stone-200">
                              from: {item.filters.origin}
                            </span>
                          )}
                          {item.filters?.destinations && item.filters.destinations.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded border border-stone-200">
                              in: {item.filters.destinations.join(', ')}
                            </span>
                          )}
                          {item.filters?.duration && (
                            <span className="px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded border border-stone-200">
                              {item.filters.duration[0]}-{item.filters.duration[1]} days
                            </span>
                          )}
                          {item.filters?.budget && item.filters.budget < 2000 && (
                            <span className="px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded border border-stone-200">
                              &lt;${item.filters.budget}
                            </span>
                          )}
                          {item.filters?.exclusions && item.filters.exclusions.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded border border-stone-200">
                              no {item.filters.exclusions.join(', ')}
                            </span>
                          )}
                          {item.filters?.styles && item.filters.styles.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded border border-stone-200">
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
                    className="absolute top-3 right-3 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 text-stone-400 hover:text-red-500 transition-all"
                    aria-label="Delete search"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

