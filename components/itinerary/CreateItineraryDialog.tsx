'use client'

import { useState, useEffect, useRef } from 'react'
import { X, MapPin } from 'lucide-react'

interface CreateItineraryDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, vibe: string) => void
  currentVibe?: string
}

export function CreateItineraryDialog({
  isOpen,
  onClose,
  onCreate,
  currentVibe = '',
}: CreateItineraryDialogProps) {
  const [name, setName] = useState('')
  const [vibe, setVibe] = useState(currentVibe)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setName('')
      setVibe(currentVibe)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, currentVibe])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onCreate(name.trim(), vibe.trim())
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-violet-200/50 bg-gradient-to-r from-violet-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-violet-900">New Itinerary</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-violet-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-violet-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="itinerary-name" className="block text-sm font-medium text-violet-700 mb-2">
              Itinerary Name
            </label>
            <input
              ref={inputRef}
              id="itinerary-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Bali Adventure 2025"
              className="w-full px-4 py-3 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-violet-900 placeholder:text-violet-400"
            />
          </div>

          <div>
            <label htmlFor="itinerary-vibe" className="block text-sm font-medium text-violet-700 mb-2">
              Trip Vibe / Focus (optional)
            </label>
            <input
              id="itinerary-vibe"
              type="text"
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              placeholder="e.g., kite surfing, relaxation, adventure"
              className="w-full px-4 py-3 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-violet-900 placeholder:text-violet-400"
            />
            <p className="text-xs text-violet-500 mt-1">
              This helps generate more relevant activities
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-violet-300 text-violet-700 font-medium rounded-lg hover:bg-violet-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
