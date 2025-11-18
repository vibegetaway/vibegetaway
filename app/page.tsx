'use client'

import { AnimatedVibeInput } from '@/components/AnimatedVibeInput'
import { MonthSelect } from '@/components/MonthSelect'
import { LeftSidebar } from '@/components/LeftSidebar'
import WorldMap from '@/components/WorldMap'
import { useState, useEffect, useRef } from 'react'
import { fetchDestinationsWithDetails } from '@/lib/fetchDestinations'
import type { Destination } from '@/lib/generateDestinationInfo'
import mockDestinations from '@/data/mock-gemini-response.json'

const isDev = process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev-local'

// Number of destinations to fetch in parallel per batch
const BATCH_SIZE = 5

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
    if (!v.trim() || !m) {
      return
    }

    const callId = ++callIdRef.current
    setLoading(true)
    setDestinations([])

    try {
      await fetchDestinationsWithDetails({
        batchSize: BATCH_SIZE,
        params: {
          vibe: v,
          timePeriod: m,
        },
        callbacks: {
          onInitialDestinations: (destinations) => {
            // Ignore if a newer call started
            if (callId !== callIdRef.current) {
              return
            }
            
            setDestinations(destinations)
            setLoading(false)
          },
          onBatchComplete: (updatedDestinations) => {
            // Ignore if a newer call started
            if (callId !== callIdRef.current) {
              return
            }
            
            setDestinations(updatedDestinations)
          },
          onComplete: () => {
            console.log('[INFO] All destination details loaded')
          },
          onError: (error) => {
            console.error('[ERROR] Callback onError:', error.message)
            if (callId === callIdRef.current) setLoading(false)
          },
        },
      })
    } catch (err) {
      console.error('[ERROR] handleFindDestinations catch:', err instanceof Error ? err.message : 'An error occurred')
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedVibe, month])

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <LeftSidebar />
      <div className="absolute top-4 left-24 z-20 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3">
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
