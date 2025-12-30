'use client'

import dynamic from 'next/dynamic'

const ExploreMap = dynamic(() => import('@/components/explore/ExploreMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
})

export default function ExplorePage() {
  return (
    <main className="fixed inset-0">
      <ExploreMap className="w-full h-full" />
    </main>
  )
}


