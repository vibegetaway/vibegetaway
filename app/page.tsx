'use client'

import { AnimatedVibeInput } from '@/components/AnimatedVibeInput'
import { MonthSelect } from '@/components/MonthSelect'
import WorldMap from '@/components/WorldMap'
import { useState, useEffect, useRef } from 'react'
import { generateSuitableDestinationInfo, type Destination } from '@/lib/generateDestinationInfo'
import mockDestinations from '@/data/mock-gemini-response.json'

const isDev = process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev-local'

function useDebouncedValue<T>(value: T, delay = 500) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export default function Home() {
  const [destinations, setDestinations] = useState<Destination[]>(isDev ? mockDestinations as Destination[] : [])
  const [loading, setLoading] = useState(false)
  const [vibe, setVibe] = useState(isDev ? 'climb' : '')
  const [month, setMonth] = useState(isDev ? 'November' : '')

  // Debounced input (500ms)
  const debouncedVibe = useDebouncedValue(vibe, 500)

  // Ensure only the latest async call updates state
  const callIdRef = useRef(0)
  
  // Track if this is the initial load (for dev mode only)
  const isInitialLoadRef = useRef(true)

  const handleFindDestinations = async (v: string, m: string) => {
    if (!v.trim() || !m) return

    // In dev mode, use mock data only on initial load
    if (isDev && isInitialLoadRef.current) {
      console.log(`[DEV MODE] Using mock data for initial load: Vibe: ${v}, Month: ${m}`)
      setDestinations(mockDestinations as Destination[])
      isInitialLoadRef.current = false
      return
    }

    const callId = ++callIdRef.current
    setLoading(true)
    setDestinations([])

    try {
      const result = await generateSuitableDestinationInfo({
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
        destinations={destinations}
      />
    </main>
  )
}
