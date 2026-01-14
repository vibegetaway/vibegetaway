"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Globe, ArrowDown } from "lucide-react"

export default function ExplorerHero() {
    const router = useRouter()

    return (
        <section className="h-screen w-full snap-start relative overflow-hidden bg-black text-white">
            {/* Background - Animated Gradient/Mesh */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#4c1d95_0%,_#0f172a_100%)]" />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl mix-blend-screen"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1,
                    }}
                    className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl mix-blend-screen"
                />
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('/assets/homepage/grid.svg')] opacity-10" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-12 md:p-16 pt-24 safe-area-inset-top">
                {/* Top Left: Explorer */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-md"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                            <Globe className="w-6 h-6 text-purple-300" />
                        </div>
                        <h2 className="text-xl font-medium text-purple-200 tracking-wide uppercase">Discover</h2>
                    </div>
                    <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/40 to-transparent">
                        Explorer
                    </h1>
                </motion.div>

                {/* Bottom Right: Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className="self-end text-right max-w-lg"
                >
                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6 text-white drop-shadow-2xl">
                        Find your next
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            getaway!
                        </span>
                    </h3>

                    <div className="flex flex-col items-end gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push("/explore")}
                            className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-full overflow-hidden shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] transition-shadow"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Explore Now
                                <ArrowDown className="w-5 h-5 -rotate-90 group-hover:rotate-0 transition-transform duration-300" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.button>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="flex items-center gap-2 text-white/50 text-sm font-medium"
                        >
                            <span>Scroll to Plan</span>
                            <ArrowDown className="w-4 h-4" />
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
