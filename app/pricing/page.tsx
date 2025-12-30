"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Check } from "lucide-react"

export default function Pricing() {
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your travel style
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-card rounded-2xl p-8 border border-border/50 hover:shadow-xl transition-all duration-300">
            <h3 className="text-2xl font-bold text-foreground mb-2">Free</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">AI-powered day trip planning</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Basic destination inspiration</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Save up to 5 itineraries</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Interactive maps</span>
              </li>
            </ul>

            <button className="w-full bg-muted hover:bg-muted/80 text-foreground py-3 rounded-xl font-semibold transition-all duration-200">
              Get Started
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 border-2 border-primary/30 hover:shadow-2xl transition-all duration-300 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
              Coming Soon
            </div>
            
            <h3 className="text-2xl font-bold text-foreground mb-2">Premium</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">$9</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground font-medium">Everything in Free, plus:</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Multi-day trip planning</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Group trip coordination</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Unlimited saved itineraries</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Advanced AI recommendations</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Priority support</span>
              </li>
            </ul>

            <button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105">
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

