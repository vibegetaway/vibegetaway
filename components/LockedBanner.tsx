'use client'

import { Lock } from 'lucide-react'

export function LockedBanner() {
    return (
        <div className="absolute top-0 right-0 z-20 overflow-visible">
            <div className="relative">
                <div className="flex items-center gap-1.5 bg-gradient-to-br from-amber-400 to-orange-600 text-white px-12 py-1.5 shadow-lg transform translate-x-8 -translate-y-2 rotate-45 origin-top-left">
                    <Lock className="w-3 h-3" />
                    <span className="text-xs font-bold uppercase tracking-wider">Premium</span>
                </div>
            </div>
        </div>
    )
}
