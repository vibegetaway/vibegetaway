'use client'

import { AnimatedVibeInput } from '@/components/AnimatedVibeInput'
import { MonthSelect } from '@/components/MonthSelect'
import WorldMap from '@/components/WorldMap'
import { useState, useEffect } from 'react'
import { generateSuitableDestinationInfo, type Destination } from '@/lib/generateDestinationInfo'

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function Home() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(false)
  const [vibe, setVibe] = useState('')
  const [month, setMonth] = useState('')

  const handleFindDestinations = async () => {
    if (!vibe.trim() || !month) return

    setLoading(true)
    setDestinations([])

    try {
      const result = await generateSuitableDestinationInfo({
        vibe: vibe,
        timePeriod: month,
      })
      
      setDestinations(result)
      
      console.log('Destination list:', result)
      
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleFindDestinations()
  }, [vibe, month])

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
      </div>
    </div>
      <WorldMap loading={loading} highlightedCountries={destinations.map(dest => dest.country)} />
    </main>
  )
}

