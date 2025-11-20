'use client'

import {
  generateDestinationNames,
  generateDestinationInfo,
  type Destination,
  type GenerateDestinationParams
} from './generateDestinationInfo'

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

/**
 * Client-side function that fetches destinations with progressive loading:
 * 1. First fetches lightweight destination names
 * 2. Immediately enriches with coordinates (in parallel)
 * 3. Then fetches detailed info in parallel batches
 * 4. Calls callbacks as data arrives for progressive UI updates
 */
export async function fetchDestinationsWithDetails(
  options: FetchDestinationsOptions
): Promise<Destination[]> {
  const { batchSize = 5, params, callbacks } = options

  try {
    // Step 1: Fetch destination names quickly
    console.log('[CLIENT] Step 1: Fetching destination names...')
    const destinationNames = await generateDestinationNames(params)
    console.log(`[CLIENT] Got ${destinationNames.length} destination names`)

    // Step 2: Immediately fetch coordinates for all destinations in parallel
    console.log('[CLIENT] Step 2: Fetching coordinates for all destinations in parallel...')
    const destinationsWithCoords = await Promise.all(
      destinationNames.map(async (dest) => {
        // Import getCoordinates from server
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

    // Notify initial destinations with coordinates are ready - map will fit once here
    callbacks?.onInitialDestinations?.(destinationsWithCoords)

    // Keep track of all destinations as they get updated
    let allDestinations = [...destinationsWithCoords]

    // Step 3: Fetch detailed info in parallel batches (all batches run at the same time)
    const totalDestinations = destinationsWithCoords.length
    const batches: Promise<void>[] = []

    for (let batchStart = 0; batchStart < totalDestinations; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, totalDestinations)
      const batch = destinationsWithCoords.slice(batchStart, batchEnd)
      const batchNumber = Math.floor(batchStart / batchSize) + 1

      console.log(`[CLIENT] Preparing Batch ${batchNumber}: ${batch.length} destinations`)

      // Create a promise for this batch and run in parallel
      const batchPromise = (async () => {
        try {
          console.log(`[CLIENT] Batch ${batchNumber}: Starting LLM call for ${batch.length} destinations`)

          // Make a SINGLE LLM call for the entire batch (coordinates are already in batch items)
          const batchResults = await generateDestinationInfo(
            batch.map(dest => ({ country: dest.country, region: dest.region || '' })),
            params
          )

          console.log(`[CLIENT] Batch ${batchNumber}: Received ${batchResults.length} results`)

          // Update destinations array with results, preserving the coordinates we already have
          batchResults.forEach((result, batchIndex) => {
            const actualIndex = batchStart + batchIndex
            if (result.country && result.region) {
              // Merge the detail info with the coordinates we already fetched
              allDestinations[actualIndex] = {
                ...result,
                coordinates: allDestinations[actualIndex].coordinates || result.coordinates
              }
            }
          })

          // Notify batch is complete
          callbacks?.onBatchComplete?.([...allDestinations], batchNumber)
          console.log(`[CLIENT] Batch ${batchNumber}: Complete and notified`)
        } catch (err) {
          console.error(`[CLIENT] Error fetching batch ${batchNumber}:`, err)
          // Continue with other batches even if this one fails
        }
      })()

      batches.push(batchPromise)
    }

    // Wait for all batches to complete in parallel
    console.log(`[CLIENT] Waiting for ${batches.length} batches to complete in parallel...`)
    await Promise.all(batches)
    console.log('[CLIENT] All batches complete')

    // Notify everything is complete
    callbacks?.onComplete?.()

    return allDestinations
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Failed to fetch destinations')
    callbacks?.onError?.(err)
    throw err
  }
}

