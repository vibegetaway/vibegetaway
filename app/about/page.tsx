"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function About() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button 
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-4xl">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          About VibeGetaway
        </h1>
        
        <div className="space-y-6 text-muted-foreground">
          <p className="text-lg">
            VibeGetaway is your AI-powered travel companion, designed to create personalized itineraries that match your unique travel style and preferences.
          </p>

          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
            <p>
              We believe that every journey should be as unique as the traveler. Our mission is to make travel planning effortless, intuitive, and exciting by leveraging the power of artificial intelligence to craft perfect getaways tailored to your vibe.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">What We Offer</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-primary">•</span>
                <span>AI-powered itinerary generation tailored to your preferences</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">•</span>
                <span>Day trips and multi-day adventure planning</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">•</span>
                <span>Destination inspiration based on your interests</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">•</span>
                <span>Interactive maps and detailed activity suggestions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">•</span>
                <span>Save and manage your travel plans in one place</span>
              </li>
            </ul>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">Get Started</h2>
            <p className="mb-4">
              Ready to plan your next adventure? Start by exploring our inspiration tool or jump straight into creating your perfect day trip or multi-day getaway.
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground px-6 py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105"
            >
              Start Planning
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

