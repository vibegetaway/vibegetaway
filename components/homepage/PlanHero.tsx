"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRouter } from "next/navigation"
import { Sparkles, ArrowRight, ArrowDown } from "lucide-react"
import { useEffect, useState } from "react"

const TypewriterText = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState("")

    useEffect(() => {
        let index = 0
        const intervalId = setInterval(() => {
            setDisplayedText((prev) => text.slice(0, index + 1))
            index++
            if (index === text.length) clearInterval(intervalId)
        }, 100)
        return () => clearInterval(intervalId)
    }, [text])

    return <span>{displayedText}<span className="animate-pulse">|</span></span>
}

export default function PlanHero() {
    const router = useRouter()

    return (
        <section className="h-screen w-full snap-start relative overflow-hidden bg-white text-black">
            {/* Background - Animated Grid/Beams */}
            <div className="absolute inset-0 z-0 bg-neutral-50">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                {/* Animated Orbs */}
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-pink-300/30 rounded-full blur-3xl mix-blend-multiply"
                />
                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear",
                        delay: 2,
                    }}
                    className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-sky-300/30 rounded-full blur-3xl mix-blend-multiply"
                />
            </div>

            {/* Content Container */}
            <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-12 md:p-16 pt-24 safe-area-inset-top">
                {/* Top Left: Plan */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-md"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white shadow-xl rounded-xl border border-neutral-100">
                            <Sparkles className="w-6 h-6 text-pink-500" />
                        </div>
                        <h2 className="text-xl font-medium text-neutral-500 tracking-wide uppercase">Curate</h2>
                    </div>
                    <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-neutral-900">
                        Plan
                    </h1>
                </motion.div>

                {/* Bottom Right/Center: Typewriter Text & CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className="self-center sm:self-end text-center sm:text-right max-w-2xl w-full"
                >
                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-8 text-neutral-800 min-h-[120px] sm:min-h-[auto]">
                        <TypewriterText text="Plan your next getaway" />
                    </h3>

                    <div className="flex flex-col items-center sm:items-end gap-6">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push("/plan")}
                            className="group relative px-8 py-4 bg-black text-white font-bold text-lg rounded-full overflow-hidden shadow-2xl hover:shadow-xl transition-all"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Start Planning
                                <Sparkles className="w-5 h-5 group-hover:text-yellow-300 transition-colors" />
                            </span>
                            <div className="absolute inset-0 bg-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 2, duration: 1 }}
                            className="flex items-center gap-2 text-neutral-400 text-sm font-medium"
                        >
                            <span>Install App</span>
                            <ArrowDown className="w-4 h-4 animate-bounce" />
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
