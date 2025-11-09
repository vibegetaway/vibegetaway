'use client'

import { AnimatedVibeInput } from '@/components/AnimatedVibeInput'
import { MonthSelect } from '@/components/MonthSelect'
import WorldMap from '@/components/WorldMap'
import { useState } from 'react'

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function Home() {

  const [vibe, setVibe] = useState('')
  const [month, setMonth] = useState('')

  return (
    <main>
    <div className="flex items-center justify-center p-6 bg-background">
      <div className="max-w-5xl w-full">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight text-balance">
          <span className="text-foreground">I want to </span>
          <span className="inline-block align-middle">
            <AnimatedVibeInput value={vibe} onChange={setVibe} />
          </span>
          <span className="text-foreground"> in </span>
          <span className="inline-block align-middle">
            <MonthSelect value={month} onChange={setMonth} />
          </span>
        </h1>

        {vibe && month && (
          <div className="mt-12 p-6 bg-card border-2 border-border rounded-lg">
            <p className="text-muted-foreground text-lg">
              Your travel plan: <span className="text-accent font-semibold">{vibe}</span> in{" "}
              <span className="text-accent font-semibold">{month}</span>
            </p>
          </div>
        )}
      </div>
    </div>
      <WorldMap />
    </main>
  )
}

