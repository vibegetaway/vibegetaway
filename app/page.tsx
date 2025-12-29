"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Map, Calendar, CalendarDays, Users, Sparkles, Home as HomeIcon, Plus, BookOpen } from "lucide-react"
import { LockedBanner } from "@/components/LockedBanner"
import { usePostHog } from "posthog-js/react"
import Image from "next/image"
import { SignInButton, UserButton, useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"

interface OptionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  locked?: boolean
  accentColor?: 'primary' | 'secondary' | 'chart-3'
}

function OptionCard({ title, description, icon, href, locked = false, accentColor = 'primary' }: OptionCardProps) {
  const router = useRouter()
  const posthog = usePostHog()

  const handleClick = () => {
    if (locked) return
    posthog?.capture("landing_option_clicked", { option: title, href })
    router.push(href)
  }

  const colorClasses = {
    primary: {
      bg: 'bg-gradient-to-br from-primary/20 to-primary/30 group-hover:from-primary/30 group-hover:to-primary/40',
      text: 'text-primary',
      border: 'border-primary/20',
    },
    secondary: {
      bg: 'bg-gradient-to-br from-secondary/25 to-secondary/35 group-hover:from-secondary/35 group-hover:to-secondary/45',
      text: 'text-secondary-foreground',
      border: 'border-secondary/20',
    },
    'chart-3': {
      bg: 'bg-gradient-to-br from-chart-3/25 to-chart-3/35 group-hover:from-chart-3/35 group-hover:to-chart-3/45',
      text: 'text-chart-3',
      border: 'border-chart-3/20',
    },
  }

  const colors = colorClasses[accentColor]

  return (
    <div
      onClick={handleClick}
      className={`
        group relative ${locked ? "overflow-visible" : "overflow-hidden"}
        rounded-2xl bg-card backdrop-blur-sm
        transition-all duration-300
        ${
          locked
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:shadow-2xl hover:-translate-y-2 active:scale-98"
        }
        border ${colors.border}
        p-6 sm:p-8
      `}
    >
      {locked && <LockedBanner />}

      <div className="relative z-10 flex flex-col space-y-4">
        <div
          className={`
          inline-flex items-center justify-center
          w-12 h-12 sm:w-14 sm:h-14 rounded-xl 
          ${colors.bg}
          transition-all duration-300
          ${!locked && "group-hover:scale-110"}
        `}
        >
          <div className={`w-6 h-6 sm:w-7 sm:h-7 ${colors.text}`}>{icon}</div>
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {!locked && (
          <div className="flex items-center justify-end">
            <svg
              className={`w-5 h-5 ${colors.text} transition-transform group-hover:translate-x-1`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        )}

        {locked && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Coming soon</span>
          </div>
        )}
      </div>
    </div>
  )
}

interface ItineraryCardProps {
  destination: string
  date: string
  image: string
  type: string
  keywords?: string
}

function ItineraryCard({ destination, date, image, type, keywords }: ItineraryCardProps) {
  const [imageUrl, setImageUrl] = useState<string>(image)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (keywords) {
      setLoading(true)
      fetch(`/api/unsplash-images?keywords=${encodeURIComponent(keywords)}&single=true&size=regular`)
        .then(res => res.json())
        .then(data => {
          if (data.url) {
            setImageUrl(data.url)
          }
        })
        .catch(err => {
          console.error('Error fetching image:', err)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [keywords])

  // Extract destination name without emoji for fallback
  const destinationName = destination.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim()

  return (
    <div className="group cursor-pointer bg-card backdrop-blur-sm rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 border border-border/50">
      <div className="relative h-48 sm:h-56 overflow-hidden bg-muted">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={destination}
            width={400}
            height={224}
            className="object-cover w-full h-full group-hover:scale-105 transition-all duration-500"
            onError={() => {
              // Fallback to placeholder if image fails to load
              setImageUrl("/assets/branding/banner.png")
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/95 via-foreground/30 to-transparent" />
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-card/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/50 shadow-sm">
          <span className="text-xs font-semibold text-card-foreground">{type}</span>
        </div>
        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
          <h3 className="text-lg sm:text-xl font-bold text-background mb-1 text-balance drop-shadow-lg">{destination}</h3>
          <p className="text-sm text-background/90 drop-shadow">{date}</p>
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <button className="w-full bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground text-sm font-semibold py-2.5 sm:py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow">
          View Itinerary
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const { isSignedIn } = useUser()

  const previousItineraries = [
    {
      id: 1,
      destination: "Paris, France 🇫🇷",
      date: "December 15-18, 2024",
      image: "/assets/branding/banner.png",
      type: "3 Days",
      keywords: "paris france eiffel tower",
    },
    {
      id: 2,
      destination: "Tokyo, Japan 🇯🇵",
      date: "November 28 - Dec 5, 2024",
      image: "/assets/branding/banner.png",
      type: "7 Days",
      keywords: "tokyo japan shibuya",
    },
    {
      id: 3,
      destination: "Barcelona, Spain 🇪🇸",
      date: "October 10, 2024",
      image: "/assets/branding/banner.png",
      type: "1 Day",
      keywords: "barcelona spain sagrada familia",
    },
  ]

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-chart-3/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-3xl" />
      </div>

      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-chart-3/30 via-secondary/30 via-primary/30 to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 relative">
            <button onClick={() => router.push("/")} className="flex items-center gap-2 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                <Image
                  src="/assets/icon.png"
                  alt="VibeGetaway"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg sm:text-xl font-bold text-foreground hidden sm:inline">VibeGetaway</span>
            </button>

            <div className="hidden md:flex items-center gap-3">
              {isSignedIn ? (
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 rounded-full ring-2 ring-border/50 hover:ring-primary/50 transition-all shadow-sm",
                      userButtonPopoverCard: "shadow-2xl border border-border rounded-xl",
                    }
                  }}
                />
              ) : (
                <SignInButton mode="modal">
                  <button className="px-4 sm:px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-full transition-all duration-200 hover:scale-105 active:scale-95">
                    Sign In
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-12 sm:space-y-16 lg:space-y-20 pb-24 md:pb-16 relative z-10">
        {/* Hero Section */}
        <section className="text-center py-8 sm:py-12 lg:py-16 space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-foreground">Plan your perfect</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-chart-3 bg-clip-text text-transparent">
                getaway
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Create memorable experiences with AI-powered itineraries tailored to your travel style
            </p>
          </div>
        </section>

        <section className="space-y-8 sm:space-y-10 relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
            <OptionCard
              title="Inspire"
              description="Find your next adventure with AI-powered destination recommendations"
              icon={<Map className="w-full h-full" />}
              href="/inspire"
              accentColor="chart-3"
            />

            <OptionCard
              title="Day Trip"
              description="Perfect for single day adventures"
              icon={<Calendar className="w-full h-full" />}
              href="/plan"
              accentColor="secondary"
            />

            <OptionCard
              title="Multi-Day"
              description="Extended journeys and vacations"
              icon={<CalendarDays className="w-full h-full" />}
              href="/plan-multiday"
              locked={true}
              accentColor="primary"
            />

            <OptionCard
              title="Group Trip"
              description="Coordinate with friends and family"
              icon={<Users className="w-full h-full" />}
              href="/plan-group"
              locked={true}
              accentColor="chart-3"
            />
          </div>
        </section>

        <section className="space-y-8 sm:space-y-10 relative">
          <div className="px-4 sm:px-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-2">
              <div className="inline-block">
                <div className="flex items-center gap-3 sm:gap-4">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Recent Trips</h2>
                  <button className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 hover:gap-3">
                    View All
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-transparent rounded-full mt-2" />
              </div>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">Your latest adventures</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
            {previousItineraries.map((itinerary) => (
              <ItineraryCard key={itinerary.id} {...itinerary} />
            ))}
          </div>
        </section>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-inset-bottom shadow-lg">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-chart-3/40 via-secondary/40 to-primary/40" />
        <div className="flex items-end justify-around px-2 py-3 relative">
          {/* Home */}
          <button
            onClick={() => router.push("/")}
            className="group flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-chart-3/15 active:bg-chart-3/20 active:scale-95 transition-all duration-200 flex-1"
          >
            <HomeIcon className="w-5 h-5 text-chart-3 transition-transform group-hover:scale-110" />
            <span className="text-xs text-muted-foreground">Home</span>
          </button>

          {/* Inspire */}
          <button
            onClick={() => router.push("/inspire")}
            className="group flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-secondary/15 active:bg-secondary/20 active:scale-95 transition-all duration-200 flex-1"
          >
            <Sparkles className="w-5 h-5 text-secondary transition-transform group-hover:scale-110" />
            <span className="text-xs text-muted-foreground">Inspire</span>
          </button>

          {/* Create Day Trip - Elevated Center Button */}
          <button
            onClick={() => router.push("/plan")}
            className="flex flex-col items-center -mt-6 flex-1"
          >
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary via-secondary to-chart-3 shadow-2xl flex items-center justify-center border-2 border-primary/40 active:scale-95 transition-transform hover:shadow-[0_0_30px_rgba(120,119,198,0.6)] hover:scale-105 ring-4 ring-primary/20">
              <Plus className="w-7 h-7 text-primary-foreground relative z-10 drop-shadow-lg" strokeWidth={2.5} />
            </div>
            <span className="text-xs text-muted-foreground mt-1">Plan</span>
          </button>

          {/* Itineraries History */}
          <button
            onClick={() => router.push("/itineraries")}
            className="group flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-primary/15 active:bg-primary/20 active:scale-95 transition-all duration-200 flex-1"
          >
            <BookOpen className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />
            <span className="text-xs text-muted-foreground">Trips</span>
          </button>

          {/* Account */}
          <div className="flex flex-col items-center flex-1">
            {isSignedIn ? (
              <div className="flex flex-col items-center gap-1">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 rounded-full ring-2 ring-border/50 transition-all shadow-sm hover:ring-secondary/50 hover:scale-110 active:scale-95",
                      userButtonPopoverCard: "shadow-2xl border border-border rounded-xl mb-16",
                    }
                  }}
                />
                <span className="text-xs text-muted-foreground">Account</span>
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-secondary/15 active:bg-secondary/20 active:scale-95 transition-all duration-200">
                  <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center shadow-sm hover:bg-secondary/30 transition-colors">
                    <svg className="w-5 h-5 text-secondary-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                  </div>
                  <span className="text-xs text-muted-foreground">Account</span>
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
