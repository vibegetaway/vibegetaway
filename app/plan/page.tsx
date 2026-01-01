'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PlanPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/quickstart')
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to quickstart...</p>
      </div>
    </div>
  )
}
