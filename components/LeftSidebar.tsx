'use client'

import { Menu, Bookmark, Clock, Heart, Settings } from 'lucide-react'

interface LeftSidebarProps {
  onMenuClick?: () => void
  onRecentClick?: () => void
}

export function LeftSidebar({ onMenuClick, onRecentClick }: LeftSidebarProps) {
  return (
    <div className="fixed left-0 top-0 w-20 h-screen bg-stone-50 border-r border-amber-200/50 flex flex-col items-center py-4 gap-6 z-[60]">
      {/* Menu icon */}
      <button 
        type="button"
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer" 
        onClick={onMenuClick}
        aria-label="Menu"
      >
        <Menu className="w-6 h-6 text-amber-700" strokeWidth={2} />
      </button>
      
      {/* Saved icon */}
      <button 
        type="button"
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer"
        aria-label="Saved"
      >
        <Bookmark className="w-6 h-6 text-amber-700" strokeWidth={2} />
      </button>
      
      {/* Recent icon */}
      <button 
        type="button"
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer"
        onClick={onRecentClick}
        aria-label="Recent"
      >
        <Clock className="w-6 h-6 text-amber-700" strokeWidth={2} />
      </button>
      
      {/* Favorites icon */}
      <button 
        type="button"
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer"
        aria-label="Favorites"
      >
        <Heart className="w-6 h-6 text-amber-700" strokeWidth={2} />
      </button>
      
      {/* Flex spacer */}
      <div className="flex-1" />
      
      {/* Settings icon */}
      <button 
        type="button"
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer"
        aria-label="Settings"
      >
        <Settings className="w-6 h-6 text-amber-700" strokeWidth={2} />
      </button>
    </div>
  )
}

