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
 * 2. Then fetches detailed info in parallel batches
 * 3. Calls callbacks as data arrives for progressive UI updates
 */
export async function fetchDestinationsWithDetails(
  options: FetchDestinationsOptions
): Promise<Destination[]> {
  const { batchSize = 5, params, callbacks } = options

  try {
    // Step 1: Fetch destination names quickly
    const destinationNames = await generateDestinationNames(params)
    
    // Notify initial destinations are ready
    callbacks?.onInitialDestinations?.(destinationNames)
    
    // Keep track of all destinations as they get updated
    let allDestinations = [...destinationNames]
    
    // Step 2: Fetch detailed info in batches (parallel within each batch)
    const totalDestinations = destinationNames.length
    
    for (let batchStart = 0; batchStart < totalDestinations; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, totalDestinations)
      const batch = destinationNames.slice(batchStart, batchEnd)
      const batchNumber = Math.floor(batchStart / batchSize) + 1

      console.log(`[CLIENT] Batch ${batchNumber}: Fetching ${batch.length} destinations in ONE LLM call`)

      try {
        // Make a SINGLE LLM call for the entire batch
        const batchResults = await generateDestinationInfo(
          batch.map(dest => ({ country: dest.country, region: dest.region || '' })),
          params
        )

        // Update destinations array with results
        batchResults.forEach((result, batchIndex) => {
          const actualIndex = batchStart + batchIndex
          if (result.country && result.region) {
            allDestinations[actualIndex] = result
          }
        })

        // Notify batch is complete
        callbacks?.onBatchComplete?.([...allDestinations], batchNumber)
      } catch (err) {
        console.error(`Error fetching batch ${batchNumber}:`, err)
        // Continue with next batch even if this one fails
      }
    }

    // Notify everything is complete
    callbacks?.onComplete?.()
    
    return allDestinations
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Failed to fetch destinations')
    callbacks?.onError?.(err)
    throw err
  }
}

