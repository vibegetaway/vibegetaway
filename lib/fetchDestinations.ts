'use client'

import {
  generateDestinationNames,
  generateDestinationInfo
} from './generateDestinationInfo'

import type {
  Destination,
  GenerateDestinationParams
} from './types'

export interface FetchDestinationsCallbacks {
  onInitialDestinations?: (destinations: Destination[]) => void
  onBatchComplete?: (destinations: Destination[], batchNumber: number) => void
  onComplete?: () => void
  onError?: (error: Error) => void
}

export interface FetchDestinationsOptions {
  batchSize?: number
  params: GenerateDestinationParams
  callbacks?: FetchDestinationsCallbacks
}

export async function fetchDestinationsWithDetails(
  options: FetchDestinationsOptions
): Promise<Destination[]> {
  const { batchSize = 5, params, callbacks } = options

  try {
    // 1. Fetch names
    console.log('[CLIENT] Fetching destination names...')
    const destinationNames = await generateDestinationNames(params)
    console.log(`[CLIENT] Got ${destinationNames.length} destination names`)

    // 2. Fetch coordinates
    console.log('[CLIENT] Fetching coordinates...')
    const destinationsWithCoords = await Promise.all(
      destinationNames.map(async (dest) => {
        const { getCoordinates } = await import('./generateDestinationInfo')
        const locationQuery = `${dest.region}, ${dest.country}`
        const coordinates = await getCoordinates(locationQuery)
        return {
          ...dest,
          coordinates: coordinates || undefined
        }
      })
    )
    console.log(`[CLIENT] Got coordinates for ${destinationsWithCoords.filter(d => d.coordinates).length}/${destinationsWithCoords.length} destinations`)

    callbacks?.onInitialDestinations?.(destinationsWithCoords)

    let allDestinations = [...destinationsWithCoords]

    // 3. Fetch details in batches
    const totalDestinations = destinationsWithCoords.length
    const batches: Promise<void>[] = []

    for (let batchStart = 0; batchStart < totalDestinations; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, totalDestinations)
      const batch = destinationsWithCoords.slice(batchStart, batchEnd)
      const batchNumber = Math.floor(batchStart / batchSize) + 1

      console.log(`[CLIENT] Preparing Batch ${batchNumber}: ${batch.length} destinations`)

      const batchPromise = (async () => {
        try {
          console.log(`[CLIENT] Batch ${batchNumber}: Starting LLM call for ${batch.length} destinations`)

          const batchResults = await generateDestinationInfo(
            batch.map(dest => ({ country: dest.country, region: dest.region || '' })),
            params
          )

          console.log(`[CLIENT] Batch ${batchNumber}: Received ${batchResults.length} results`)

          batchResults.forEach((result, batchIndex) => {
            const actualIndex = batchStart + batchIndex
            if (result.country && result.region) {
              allDestinations[actualIndex] = {
                ...result,
                coordinates: allDestinations[actualIndex].coordinates || result.coordinates
              }
            }
          })

          callbacks?.onBatchComplete?.([...allDestinations], batchNumber)
          console.log(`[CLIENT] Batch ${batchNumber}: Complete and notified`)
        } catch (err) {
          console.error(`[CLIENT] Error fetching batch ${batchNumber}:`, err)
        }
      })()

      batches.push(batchPromise)
    }

    console.log(`[CLIENT] Waiting for ${batches.length} batches to complete...`)
    await Promise.all(batches)
    console.log('[CLIENT] All batches complete')

    callbacks?.onComplete?.()

    return allDestinations
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Failed to fetch destinations')
    callbacks?.onError?.(err)
    throw err
  }
}

