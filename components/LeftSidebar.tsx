'use client'

import { Menu, Bookmark, Clock, Heart, Settings } from 'lucide-react'

interface LeftSidebarProps {
  onMenuClick?: () => void
}

export function LeftSidebar({ onMenuClick }: LeftSidebarProps) {
  return (
    <div className="fixed left-0 top-0 w-20 h-screen bg-stone-50 border-r border-amber-200/50 flex flex-col items-center py-4 gap-6 z-40">
      {/* Menu icon */}
      <button 
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-amber-100/60 transition-colors" 
        onClick={onMenuClick}
        aria-label="Menu"
      >
        <Menu className="w-6 h-6 text-amber-700" />
      </button>
      
      {/* Saved icon */}
      <button 
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-amber-100/60 transition-colors"
        aria-label="Saved"
      >
        <Bookmark className="w-6 h-6 text-amber-700" />
      </button>
      
      {/* Recent icon */}
      <button 
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-amber-100/60 transition-colors"
        aria-label="Recent"
      >
        <Clock className="w-6 h-6 text-amber-700" />
      </button>
      
      {/* Favorites icon */}
      <button 
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-amber-100/60 transition-colors"
        aria-label="Favorites"
      >
        <Heart className="w-6 h-6 text-amber-700" />
      </button>
      
      {/* Flex spacer */}
      <div className="flex-1" />
      
      {/* Settings icon */}
      <button 
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-amber-100/60 transition-colors"
        aria-label="Settings"
      >
        <Settings className="w-6 h-6 text-amber-700" />
      </button>
    </div>
  )
}

