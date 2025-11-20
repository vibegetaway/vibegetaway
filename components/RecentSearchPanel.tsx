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


        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-stone-900 mb-2">Recent Searches</h2>
              <p className="text-stone-600">Your search history</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-amber-100 rounded-lg transition-colors">
              <X className="w-6 h-6 text-stone-600" />
            </button>
          </div>

          {/* Clear All Button */}
          {searchHistory.length > 0 && (
            <button
              onClick={handleClearAll}
              className="mb-6 w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All History
            </button>
          )}

          {/* Search History List */}
          {searchHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="w-16 h-16 text-amber-300 mb-4" />
              <p className="text-stone-600 text-lg mb-2">No recent searches</p>
              <p className="text-stone-400 text-sm">Your search history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchHistory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSearchClick(item)}
                  className="w-full p-4 bg-white hover:bg-amber-50/50 border border-amber-200/50 hover:border-amber-300 rounded-lg transition-all text-left group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      {/* Search Text */}
                      <p className="text-stone-900 font-medium mb-1">
                        {formatSearchText(item.vibe, item.timePeriod)}
                      </p>

                      {/* Timestamp and Destination Count */}
                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(item.timestamp)}
                        </span>
                        {item.destinations && item.destinations.length > 0 && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                            {item.destinations.length} destinations
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg transition-all"
                      aria-label="Delete search"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

