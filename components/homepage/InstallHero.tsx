"use client"

import { motion } from "framer-motion"
import { Download, Share, Smartphone, PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"

export default function InstallHero() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop')
    const [showInstructions, setShowInstructions] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase()
        const isIOS = /iphone|ipad|ipod/.test(userAgent)
        const isAndroid = /android/.test(userAgent)

        if (isIOS) setPlatform('ios')
        else if (isAndroid) setPlatform('android')
        else setPlatform('desktop')

        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e)
        }

        window.addEventListener('beforeinstallprompt', handler)

        const matches = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true
        setIsStandalone(matches)

        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstall = async () => {
        if (isStandalone) return
        if (platform === 'ios') {
            setShowInstructions(true)
            return
        }
        if (deferredPrompt) {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            setDeferredPrompt(null)
        } else {
            setShowInstructions(true)
        }
    }

    return (
        <section className="h-screen w-full snap-start relative overflow-hidden bg-neutral-900 text-white flex items-center justify-center">
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0)_70%)]" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-4"
                >
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                        Take it with you
                    </h2>
                    <p className="text-lg sm:text-xl text-neutral-400 max-w-xl mx-auto">
                        Install VibeGetaway for the best experience. Offline access, smoother animations, and more.
                    </p>
                </motion.div>

                {!isStandalone && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleInstall}
                        className="inline-flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-[0_0_40px_rgba(219,39,119,0.4)] transition-all"
                    >
                        <Download className="w-6 h-6" />
                        {platform === 'ios' ? 'Install on iOS' : 'Install App'}
                    </motion.button>
                )}

                {isStandalone && (
                    <div className="text-green-400 font-medium flex items-center justify-center gap-2">
                        <Smartphone className="w-5 h-5" />
                        App Installed
                    </div>
                )}

                {/* Instructions Modal Overlay */}
                {showInstructions && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        onClick={() => setShowInstructions(false)}
                    >
                        <div onClick={e => e.stopPropagation()} className="bg-neutral-800 border border-neutral-700 p-8 rounded-3xl max-w-sm w-full space-y-6 shadow-2xl">
                            <h3 className="text-2xl font-bold">Install Instructions</h3>

                            {platform === 'ios' ? (
                                <div className="space-y-4 text-left">
                                    <div className="flex items-center gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-neutral-700 rounded-full font-bold">1</span>
                                        <p>Tap the <Share className="inline w-4 h-4 mx-1" /> Share button</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-neutral-700 rounded-full font-bold">2</span>
                                        <p>Scroll down and tap <span className="font-bold">Add to Home Screen</span></p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-neutral-700 rounded-full font-bold">3</span>
                                        <p>Tap <span className="font-bold">Add</span></p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 text-left">
                                    <div className="flex items-center gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-neutral-700 rounded-full font-bold">1</span>
                                        <p>Tap the menu button (three dots)</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-neutral-700 rounded-full font-bold">2</span>
                                        <p>Select <span className="font-bold">Install App</span> or <span className="font-bold">Add to Home Screen</span></p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setShowInstructions(false)}
                                className="w-full py-3 bg-neutral-700 hover:bg-neutral-600 rounded-xl font-medium transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </section>
    )
}
