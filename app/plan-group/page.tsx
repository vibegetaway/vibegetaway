'use client'

import { useRouter } from 'next/navigation'
import { Users, ArrowLeft, Lock, Sparkles } from 'lucide-react'
import { LockedBanner } from '@/components/LockedBanner'

export default function PlanGroup() {
    const router = useRouter()

    return (
        <main className="min-h-screen bg-gradient-to-br from-orange-900 via-amber-900 to-yellow-900 flex items-center justify-center p-4">
            <div className="relative max-w-2xl w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-12">
                <LockedBanner />

                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="p-6 rounded-full bg-white/20 backdrop-blur-sm">
                        <Users className="w-16 h-16 md:w-20 md:h-20 text-white" />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Lock className="w-5 h-5 text-yellow-300" />
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                Plan Group Trip
                            </h1>
                        </div>
                        <p className="text-white/80 text-lg">
                            Coming Soon!
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-3">
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                            <p className="text-white/90 text-left">
                                Collaborate with friends and family to plan the perfect group getaway
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                            <p className="text-white/90 text-left">
                                Shared itineraries with real-time updates and voting features
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                            <p className="text-white/90 text-left">
                                Budget splitting and expense tracking for seamless coordination
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium rounded-lg transition-all duration-200 hover:scale-105"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </button>
                </div>
            </div>
        </main>
    )
}
