'use client'

import { AnimatedVibeInput } from '@/components/AnimatedVibeInput'
import { MonthSelect } from '@/components/MonthSelect'
import WorldMap from '@/components/WorldMap'
import { useState, useEffect, useRef } from 'react'
import { generateDestinationNames, generateDestinationInfo, type Destination } from '@/lib/generateDestinationInfo'
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
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(false)
  const [vibe, setVibe] = useState(isDev ? 'climb' : '')
  const [month, setMonth] = useState(isDev ? 'November' : '')

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
      // Step 1: Fetch destination names quickly
      const destinationNames = await generateDestinationNames({
        vibe: v,
        timePeriod: m,
      })

      // Ignore if a newer call started after this one
      if (callId !== callIdRef.current) return

      // Set initial destinations with just names
      setDestinations(destinationNames)
      console.log(`Vibe: ${v}, Month: ${m}, Initial Destinations: ${JSON.stringify(destinationNames)}`)

      // Stop showing loading indicator - destinations are now visible on the map
      setLoading(false)

      // Step 2: Sequentially fetch detailed info for each destination (in background)
      for (let i = 0; i < destinationNames.length; i++) {
        // Check if a newer call started
        if (callId !== callIdRef.current) return

        const dest = destinationNames[i]
        if (!dest.country || !dest.region) continue

        try {
          const detailedInfo = await generateDestinationInfo(
            { country: dest.country, region: dest.region },
            { vibe: v, timePeriod: m }
          )

          // Check again if a newer call started
          if (callId !== callIdRef.current) return

          // Update the specific destination with detailed info
          setDestinations(prev => {
            const updated = [...prev]
            updated[i] = detailedInfo
            return updated
          })

          console.log(`Fetched details for ${dest.region}, ${dest.country}`)
        } catch (err) {
          console.error(`Error fetching details for ${dest.region}:`, err)
          // Continue with next destination even if one fails
        }
      }
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'An error occurred')
      // Only reset loading if the initial fetch fails
      if (callId === callIdRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    if (isDev && debouncedVibe === 'climb' && month === 'November') {
      console.log('[DEV MODE] Skipping API call for initial values, using pre-loaded mock data:', mockDestinations)
      setDestinations(mockDestinations as Destination[])
      setLoading(false)
      return
    }
    
    handleFindDestinations(debouncedVibe, month)
  }, [debouncedVibe, month])

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3">
        <h1 className="text-xl font-bold leading-tight">
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
      <WorldMap
        loading={loading}
        destinations={destinations}
      />
    </main>
  )
}
