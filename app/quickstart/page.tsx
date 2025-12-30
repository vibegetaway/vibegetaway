"use client"

import { useRouter } from "next/navigation"

export default function QuickStart() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Quick Start Your Journey
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Plan your perfect trip in minutes
          </p>
          
          <div className="bg-card rounded-2xl p-8 border border-border">
            <p className="text-center text-muted-foreground">
              QuickStart planning interface coming soon...
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

