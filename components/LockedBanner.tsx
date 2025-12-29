'use client'

import { Lock } from 'lucide-react'

export function LockedBanner() {
    return (
        <div className="absolute top-0 right-0 z-20 overflow-visible">
            <div className="relative">
                {/* Corner ribbon with gradient */}
                <div className="flex items-center gap-1.5 bg-gradient-to-br from-gray-400 to-gray-600 text-white px-8 py-1.5 shadow-lg transform translate-x-4 -translate-y-1 rotate-45 origin-top-left">
                    <Lock className="w-3 h-3" />
                    <span className="text-xs font-bold uppercase tracking-wider">Coming Soon</span>
                </div>
            </div>
        </div>
    )
}
