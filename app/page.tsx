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
      })
      
      setDestinations(result)
      
      // Log entire destination list with all information to console
      console.log('Destination list:', result)
      
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
        <h1 className="text-5xl font-bold leading-tight text-balance">
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
            <button
              onClick={handleFindDestinations}
              disabled={loading}
              className="w-full py-5 px-8 bg-accent text-accent-foreground font-bold text-xl rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg transition-all duration-200 ease-in-out transform"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Finding destinations...
                </span>
              ) : (
                'Find Destinations'
              )}
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
      <WorldMap destinations={destinations} />
    </main>
  )
}

