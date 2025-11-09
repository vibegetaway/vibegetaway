'use client'

import { AnimatedVibeInput } from '@/components/AnimatedVibeInput'
import { MonthSelect } from '@/components/MonthSelect'
import WorldMap from '@/components/WorldMap'
import { useState } from 'react'
import { generateSuitableDestinationInfo, type Destination } from '@/lib/generateDestinationInfo'

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function Home() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [vibe, setVibe] = useState('')
  const [month, setMonth] = useState('')

  const handleFindDestinations = async () => {
    if (!vibe.trim() || !month) return

    setLoading(true)
    setError('')
    setDestinations([])

    try {
      const result = await generateSuitableDestinationInfo({
        vibe: vibe,
        timePeriod: month,
        // price and from are optional for now
      })
      
      setDestinations(result)
      
      // Log countries to console
      const countries = result.map(dest => dest.country)
      console.log('Destination countries:', countries)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

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
          <div className="mt-12 space-y-4">
            <div className="p-6 bg-card border-2 border-border rounded-lg">
              <p className="text-muted-foreground text-lg">
                Your travel plan: <span className="text-accent font-semibold">{vibe}</span> in{" "}
                <span className="text-accent font-semibold">{month}</span>
              </p>
            </div>
            
            <button
              onClick={handleFindDestinations}
              disabled={loading}
              className="w-full py-4 px-6 bg-accent text-accent-foreground font-semibold text-lg rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? 'Finding destinations...' : 'Find Destinations'}
            </button>

            {error && (
              <div className="p-6 bg-destructive/10 border-2 border-destructive rounded-lg">
                <p className="text-destructive font-semibold">Error:</p>
                <p className="text-destructive">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
      <WorldMap highlightedCountries={destinations.map(dest => dest.country)} />
    </main>
  )
}

