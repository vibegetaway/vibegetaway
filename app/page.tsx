'use client'

import { AnimatedVibeInput } from '@/components/AnimatedVibeInput'
import { MonthSelect } from '@/components/MonthSelect'
import WorldMap from '@/components/WorldMap'
import { useState, useEffect, useRef } from 'react'
import { generateSuitableCountries, type Destination } from '@/lib/generateDestinationInfo'

function useDebouncedValue<T>(value: T, delay = 500) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export default function Home() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(false)
  const [vibe, setVibe] = useState('')
  const [month, setMonth] = useState('')

  // Debounced input (500ms)
  const debouncedVibe = useDebouncedValue(vibe, 500)

  // Ensure only the latest async call updates state
  const callIdRef = useRef(0)

  const handleFindDestinations = async (v: string, m: string) => {
    if (!v.trim() || !m) return

    const callId = ++callIdRef.current
    setLoading(true)
    setDestinations([])

    try {
      const result = await generateSuitableCountries({
        vibe: v,
        timePeriod: m,
      })

      // Ignore if a newer call started after this one
      if (callId !== callIdRef.current) return

      setDestinations(result)
      console.log(`Vibe: ${v}, Month: ${m}, Destinations: ${JSON.stringify(result)}`)
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      if (callId === callIdRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    handleFindDestinations(debouncedVibe, month)
  }, [debouncedVibe, month])

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
      <WorldMap
        loading={loading}
        highlightedCountries={destinations.map(dest => dest.country)}
      />
    </main>
  )
}
